import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { savePushSubscription, getVapidPublicKey } from "@/lib/notifications/push"
import { isFeatureEnabled } from "@/lib/features"

export async function GET() {
  // Return VAPID public key for client-side subscription
  const vapidKey = getVapidPublicKey()

  if (!vapidKey) {
    return NextResponse.json(
      { error: "Push notifications not configured" },
      { status: 503 }
    )
  }

  return NextResponse.json({ vapidPublicKey: vapidKey })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if push notifications feature is enabled
    const isEnabled = await isFeatureEnabled("push_notifications")
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Push notifications are disabled" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      )
    }

    const subscription = await savePushSubscription(session.user.id, {
      endpoint,
      keys,
    })

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
    })
  } catch (error) {
    console.error("Error saving push subscription:", error)
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    )
  }
}
