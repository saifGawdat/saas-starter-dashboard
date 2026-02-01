import { auth } from "@/auth"
import { sseManager } from "@/lib/notifications/sse"
import { isFeatureEnabled } from "@/lib/features"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Check if real-time notifications feature is enabled
  const isEnabled = await isFeatureEnabled("realtime_notifications")
  if (!isEnabled) {
    return new Response("Real-time notifications are disabled", { status: 403 })
  }

  const clientId = `${session.user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const userId = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      // Register the client
      sseManager.addClient(clientId, userId, controller)

      // Send initial connection message
      const message = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`
      controller.enqueue(new TextEncoder().encode(message))

      // Set up heartbeat interval
      const heartbeatInterval = setInterval(() => {
        sseManager.sendHeartbeat(clientId)
      }, 30000) // Every 30 seconds

      // Clean up on close
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        sseManager.removeClient(clientId)
      }

      // Store cleanup function for later
      ;(controller as unknown as { cleanup: () => void }).cleanup = cleanup
    },
    cancel(controller) {
      // Call cleanup when stream is cancelled
      const ctrl = controller as unknown as { cleanup?: () => void }
      if (ctrl.cleanup) {
        ctrl.cleanup()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
