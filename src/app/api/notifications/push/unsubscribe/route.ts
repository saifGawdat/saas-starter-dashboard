import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { removePushSubscription } from "@/lib/notifications/push"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      )
    }

    await removePushSubscription(endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing push subscription:", error)
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    )
  }
}
