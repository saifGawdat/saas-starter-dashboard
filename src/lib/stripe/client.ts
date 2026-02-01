import Stripe from "stripe"

// Singleton pattern for Stripe client
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not configured")
    return null
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  }

  return stripeInstance
}

/**
 * Get Stripe publishable key for client-side
 */
export function getPublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY || null
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  )
}
