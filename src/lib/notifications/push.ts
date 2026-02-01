import { db } from "@/lib/db"

// Web Push notification utilities
// Note: web-push package should be installed for full functionality

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: { action: string; title: string }[]
}

/**
 * Save a push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
) {
  return db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  })
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(endpoint: string) {
  return db.pushSubscription.delete({
    where: { endpoint },
  })
}

/**
 * Get all push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: string) {
  return db.pushSubscription.findMany({
    where: { userId },
  })
}

/**
 * Send a push notification to a user
 * Requires web-push package and VAPID keys to be configured
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  const subscriptions = await getUserPushSubscriptions(userId)

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 }
  }

  // Check if web-push is available
  let webpush: typeof import("web-push") | null = null
  try {
    webpush = await import("web-push")
  } catch {
    console.warn("[Push] web-push package not installed")
    return { success: 0, failed: subscriptions.length }
  }

  // Check for VAPID keys
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL || "admin@example.com"

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[Push] VAPID keys not configured")
    return { success: 0, failed: subscriptions.length }
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

  let success = 0
  let failed = 0

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify(payload)
      )
      success++
    } catch (error: unknown) {
      console.error(`[Push] Failed to send notification:`, error)
      failed++

      // Remove invalid subscriptions
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        (error.statusCode === 404 || error.statusCode === 410)
      ) {
        await removePushSubscription(subscription.endpoint)
      }
    }
  }

  return { success, failed }
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null
}
