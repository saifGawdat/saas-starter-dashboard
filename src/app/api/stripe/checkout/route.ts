import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { isFeatureEnabled } from "@/lib/features"
import { z } from "zod"

const checkoutSchema = z.object({
  planId: z.string().min(1),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Stripe billing is enabled
    const isEnabled = await isFeatureEnabled("stripe_billing")
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Stripe billing is not enabled" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = checkoutSchema.parse(body)

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    const result = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      planId: data.planId,
      billingPeriod: data.billingPeriod,
      successUrl: `${baseUrl}/dashboard/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
    })

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
