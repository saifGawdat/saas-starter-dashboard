import Stripe from "stripe"
import { getStripe } from "./client"
import { db } from "@/lib/db"

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): Stripe.Event | null {
  const stripe = getStripe()
  if (!stripe) return null

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[Stripe] STRIPE_WEBHOOK_SECRET not configured")
    return null
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error("[Stripe] Webhook signature verification failed:", error)
    return null
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  const billingPeriod = session.metadata?.billingPeriod as "MONTHLY" | "YEARLY"

  if (!userId || !planId) {
    console.error("[Stripe] Missing metadata in checkout session")
    return
  }

  const stripeSubscription = session.subscription as string

  // Update or create subscription
  await db.subscription.upsert({
    where: { userId },
    update: {
      planId,
      billingPeriod,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription,
      status: "ACTIVE",
    },
    create: {
      userId,
      planId,
      billingPeriod,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  console.log(`[Stripe] Subscription created/updated for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    // Try to find by stripeSubscriptionId
    const existing = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })
    if (!existing) return
  }

  const status = mapStripeStatus(subscription.status)

  // Get period info from subscription items (new Stripe API structure)
  const firstItem = subscription.items.data[0]
  const currentPeriodStart = firstItem?.current_period_start
  const currentPeriodEnd = firstItem?.current_period_end

  await db.subscription.updateMany({
    where: {
      OR: [
        { stripeSubscriptionId: subscription.id },
        ...(userId ? [{ userId }] : []),
      ],
    },
    data: {
      status,
      stripePriceId: firstItem?.price.id,
      ...(currentPeriodStart && {
        currentPeriodStart: new Date(currentPeriodStart * 1000),
      }),
      ...(currentPeriodEnd && {
        currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      }),
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  })

  console.log(`[Stripe] Subscription ${subscription.id} updated to ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  })

  console.log(`[Stripe] Subscription ${subscription.id} canceled`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Get subscription ID from parent.subscription_details (new Stripe API structure)
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription as string | undefined

  if (!subscriptionId) return

  const subscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!subscription) return

  await db.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      status: invoice.status || "paid",
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
    },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency,
      status: invoice.status || "paid",
      pdfUrl: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
    },
  })

  console.log(`[Stripe] Invoice ${invoice.id} recorded as paid`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID from parent.subscription_details (new Stripe API structure)
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription as string | undefined

  if (!subscriptionId) return

  // Update subscription status to past_due
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  })

  console.log(`[Stripe] Invoice ${invoice.id} payment failed`)
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" {
  switch (stripeStatus) {
    case "trialing":
      return "TRIALING"
    case "active":
      return "ACTIVE"
    case "past_due":
      return "PAST_DUE"
    case "canceled":
    case "unpaid":
      return "CANCELED"
    case "incomplete":
    case "incomplete_expired":
      return "EXPIRED"
    default:
      return "ACTIVE"
  }
}
