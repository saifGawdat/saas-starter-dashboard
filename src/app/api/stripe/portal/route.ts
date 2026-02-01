import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createBillingPortalSession } from "@/lib/stripe/checkout"
import { isFeatureEnabled } from "@/lib/features"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
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

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    const result = await createBillingPortalSession(
      session.user.id,
      `${baseUrl}/dashboard/billing`
    )

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
