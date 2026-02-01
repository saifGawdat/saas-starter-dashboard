import { getStripe } from "./client"
import { db } from "@/lib/db"

interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  planId: string
  billingPeriod: "MONTHLY" | "YEARLY"
  successUrl: string
  cancelUrl: string
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe()
  if (!stripe) {
    return { error: "Stripe is not configured" }
  }

  const { userId, userEmail, planId, billingPeriod, successUrl, cancelUrl } = params

  // Get the plan
  const plan = await db.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    return { error: "Plan not found" }
  }

  // Get or create Stripe price
  const priceId =
    billingPeriod === "YEARLY"
      ? plan.stripeYearlyPriceId
      : plan.stripeMonthlyPriceId

  if (!priceId) {
    return { error: "Plan not configured for Stripe billing" }
  }

  // Get or create customer
  let customerId: string | undefined

  const existingSubscription = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  })

  if (existingSubscription?.stripeCustomerId) {
    customerId = existingSubscription.stripeCustomerId
  } else {
    // Create new customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    })
    customerId = customer.id
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
      metadata: {
        userId,
        planId,
      },
    },
    metadata: {
      userId,
      planId,
      billingPeriod,
    },
  })

  if (!session.url) {
    return { error: "Failed to create checkout session" }
  }

  return { url: session.url }
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe()
  if (!stripe) {
    return { error: "Stripe is not configured" }
  }

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  })

  if (!subscription?.stripeCustomerId) {
    return { error: "No Stripe customer found" }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}
