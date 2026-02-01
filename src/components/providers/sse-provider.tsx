"use client"

import { useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useSSEStore } from "@/stores/sse-store"
import { useNotificationStore } from "@/stores/notification-store"
import { toast } from "sonner"

interface SSEProviderProps {
  children: React.ReactNode
  enabled?: boolean
}

export function SSEProvider({ children, enabled = true }: SSEProviderProps) {
  const { data: session, status } = useSession()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    isConnected,
    setConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setLastEventTime,
  } = useSSEStore()

  const { addNotification } = useNotificationStore()

  const connect = useCallback(() => {
    if (!enabled || status !== "authenticated" || !session?.user?.id) {
      return
    }

    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log("[SSE] Max reconnection attempts reached")
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log("[SSE] Connecting...")
    const eventSource = new EventSource("/api/notifications/sse")
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("[SSE] Connection opened")
      resetReconnectAttempts()
    }

    eventSource.addEventListener("connected", (event) => {
      const data = JSON.parse(event.data)
      console.log("[SSE] Connected with client ID:", data.clientId)
      setConnected(true, data.clientId)
      setLastEventTime(new Date())
    })

    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data)
      console.log("[SSE] Received notification:", notification)

      // Add to notification store
      addNotification({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        isRead: false,
        link: notification.link,
        createdAt: notification.createdAt,
      })

      // Show toast
      toast(notification.title, {
        description: notification.message,
      })

      setLastEventTime(new Date())
    })

    eventSource.addEventListener("system", (event) => {
      const data = JSON.parse(event.data)
      console.log("[SSE] System message:", data)

      // Show system toast
      if (data.type === "alert") {
        toast.warning(data.title, { description: data.message })
      } else {
        toast.info(data.title, { description: data.message })
      }

      setLastEventTime(new Date())
    })

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error)
      setConnected(false, null)

      // Clean up and schedule reconnect
      eventSource.close()
      eventSourceRef.current = null

      incrementReconnectAttempts()

      // Exponential backoff for reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
      console.log(`[SSE] Reconnecting in ${delay}ms...`)

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [
    enabled,
    status,
    session?.user?.id,
    reconnectAttempts,
    maxReconnectAttempts,
    setConnected,
    resetReconnectAttempts,
    incrementReconnectAttempts,
    setLastEventTime,
    addNotification,
  ])

  useEffect(() => {
    connect()

    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      setConnected(false, null)
    }
  }, [connect, setConnected])

  // Reconnect when visibility changes back to visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected && enabled) {
        resetReconnectAttempts()
        connect()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isConnected, enabled, connect, resetReconnectAttempts])

  return <>{children}</>
}
