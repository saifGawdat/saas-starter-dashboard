import { getStripe } from "./client"
import { db } from "@/lib/db"

/**
 * Sync a plan to Stripe (create product and prices)
 */
export async function syncPlanToStripe(planId: string) {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe is not configured")
  }

  const plan = await db.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    throw new Error("Plan not found")
  }

  let productId = plan.stripeProductId

  // Create or update product
  if (!productId) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: { planId: plan.id },
    })
    productId = product.id
  } else {
    await stripe.products.update(productId, {
      name: plan.name,
      description: plan.description || undefined,
    })
  }

  // Create monthly price if not exists
  let monthlyPriceId = plan.stripeMonthlyPriceId
  if (!monthlyPriceId && Number(plan.monthlyPrice) > 0) {
    const monthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(Number(plan.monthlyPrice) * 100),
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { planId: plan.id, billingPeriod: "MONTHLY" },
    })
    monthlyPriceId = monthlyPrice.id
  }

  // Create yearly price if not exists
  let yearlyPriceId = plan.stripeYearlyPriceId
  if (!yearlyPriceId && Number(plan.yearlyPrice) > 0) {
    const yearlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(Number(plan.yearlyPrice) * 100),
      currency: "usd",
      recurring: { interval: "year" },
      metadata: { planId: plan.id, billingPeriod: "YEARLY" },
    })
    yearlyPriceId = yearlyPrice.id
  }

  // Update plan with Stripe IDs
  await db.plan.update({
    where: { id: planId },
    data: {
      stripeProductId: productId,
      stripeMonthlyPriceId: monthlyPriceId,
      stripeYearlyPriceId: yearlyPriceId,
    },
  })

  return { productId, monthlyPriceId, yearlyPriceId }
}

/**
 * Sync all plans to Stripe
 */
export async function syncAllPlansToStripe() {
  const plans = await db.plan.findMany({
    where: { status: "ACTIVE" },
  })

  const results = []
  for (const plan of plans) {
    try {
      const result = await syncPlanToStripe(plan.id)
      results.push({ planId: plan.id, success: true, ...result })
    } catch (error) {
      results.push({
        planId: plan.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}

/**
 * Get invoices for a subscription from Stripe
 */
export async function getInvoicesFromStripe(stripeCustomerId: string) {
  const stripe = getStripe()
  if (!stripe) {
    return []
  }

  const invoices = await stripe.invoices.list({
    customer: stripeCustomerId,
    limit: 100,
  })

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: invoice.status,
    pdfUrl: invoice.invoice_pdf,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    periodStart: new Date(invoice.period_start * 1000),
    periodEnd: new Date(invoice.period_end * 1000),
    paidAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : null,
    createdAt: new Date(invoice.created * 1000),
  }))
}
