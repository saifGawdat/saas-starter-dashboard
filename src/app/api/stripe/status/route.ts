import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

    return NextResponse.json({
      configured: hasSecretKey && hasPublishableKey,
      hasSecretKey,
      hasPublishableKey,
      hasWebhookSecret,
    })
  } catch (error) {
    console.error("Error checking Stripe status:", error)
    return NextResponse.json(
      { error: "Failed to check Stripe status" },
      { status: 500 }
    )
  }
}
