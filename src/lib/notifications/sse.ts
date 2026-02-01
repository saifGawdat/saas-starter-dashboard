// SSE Connection Manager for Real-time Notifications
// This module manages Server-Sent Events connections for broadcasting notifications

type SSEClient = {
  id: string
  userId: string
  controller: ReadableStreamDefaultController
  createdAt: Date
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map()
  private userConnections: Map<string, Set<string>> = new Map()

  /**
   * Register a new SSE connection
   */
  addClient(
    clientId: string,
    userId: string,
    controller: ReadableStreamDefaultController
  ) {
    this.clients.set(clientId, {
      id: clientId,
      userId,
      controller,
      createdAt: new Date(),
    })

    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set())
    }
    this.userConnections.get(userId)!.add(clientId)

    console.log(`[SSE] Client ${clientId} connected for user ${userId}`)
  }

  /**
   * Remove an SSE connection
   */
  removeClient(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      // Remove from user connections
      const userClients = this.userConnections.get(client.userId)
      if (userClients) {
        userClients.delete(clientId)
        if (userClients.size === 0) {
          this.userConnections.delete(client.userId)
        }
      }

      this.clients.delete(clientId)
      console.log(`[SSE] Client ${clientId} disconnected`)
    }
  }

  /**
   * Send a message to a specific user
   */
  sendToUser(userId: string, event: string, data: unknown) {
    const userClients = this.userConnections.get(userId)
    if (!userClients) return 0

    let sent = 0
    for (const clientId of userClients) {
      const client = this.clients.get(clientId)
      if (client) {
        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          client.controller.enqueue(new TextEncoder().encode(message))
          sent++
        } catch (error) {
          console.error(`[SSE] Error sending to client ${clientId}:`, error)
          this.removeClient(clientId)
        }
      }
    }
    return sent
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(event: string, data: unknown) {
    let sent = 0
    for (const [clientId, client] of this.clients) {
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        client.controller.enqueue(new TextEncoder().encode(message))
        sent++
      } catch (error) {
        console.error(`[SSE] Error broadcasting to client ${clientId}:`, error)
        this.removeClient(clientId)
      }
    }
    return sent
  }

  /**
   * Send a heartbeat to keep connections alive
   */
  sendHeartbeat(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      try {
        const message = `: heartbeat\n\n`
        client.controller.enqueue(new TextEncoder().encode(message))
      } catch (error) {
        this.removeClient(clientId)
      }
    }
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      totalConnections: this.clients.size,
      uniqueUsers: this.userConnections.size,
      connections: Array.from(this.clients.values()).map((c) => ({
        id: c.id,
        userId: c.userId,
        connectedAt: c.createdAt.toISOString(),
      })),
    }
  }
}

// Singleton instance
export const sseManager = new SSEManager()

/**
 * Send a notification to a specific user via SSE
 */
export function sendSSENotification(
  userId: string,
  notification: {
    id: string
    title: string
    message: string
    type: string
    category: string
    link?: string | null
    createdAt: Date
  }
) {
  return sseManager.sendToUser(userId, "notification", notification)
}

/**
 * Broadcast a system-wide notification
 */
export function broadcastSSENotification(data: {
  type: "system" | "update" | "alert"
  title: string
  message: string
}) {
  return sseManager.broadcast("system", data)
}
