import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature, handleWebhookEvent } from "@/lib/stripe/webhooks"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const event = verifyWebhookSignature(payload, signature)

    if (!event) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    await handleWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
