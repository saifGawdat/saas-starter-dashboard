"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

interface PushPermissionProps {
  onDismiss?: () => void
}

export function PushPermission({ onDismiss }: PushPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }

    // Check if user has dismissed this prompt before
    const dismissed = localStorage.getItem("push-permission-dismissed")
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleEnable = async () => {
    setIsLoading(true)

    try {
      // Request permission
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Get VAPID public key
        const keyResponse = await fetch("/api/notifications/push/subscribe")
        if (!keyResponse.ok) {
          throw new Error("Push notifications not configured")
        }
        const { vapidPublicKey } = await keyResponse.json()

        // Register service worker if not already registered
        let registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js")
        }

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        })

        // Save subscription to server
        const subscribeResponse = await fetch("/api/notifications/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        })

        if (!subscribeResponse.ok) {
          throw new Error("Failed to save subscription")
        }

        toast.success("Push notifications enabled!")
        setIsDismissed(true)
      } else if (result === "denied") {
        toast.error("Push notifications blocked. Enable them in your browser settings.")
      }
    } catch (error) {
      console.error("Error enabling push notifications:", error)
      toast.error(error instanceof Error ? error.message : "Failed to enable notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("push-permission-dismissed", "true")
    setIsDismissed(true)
    onDismiss?.()
  }

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === "granted" || isDismissed) {
    return null
  }

  // Don't show if already denied (user can enable in browser settings)
  if (permission === "denied") {
    return null
  }

  return (
    <Card className="relative border-primary/20 bg-primary/5">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Enable Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about important updates even when you're not on this page.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-2">
        <Button onClick={handleEnable} disabled={isLoading} size="sm">
          {isLoading ? "Enabling..." : "Enable"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={isLoading}
        >
          <BellOff className="mr-2 h-4 w-4" />
          Not now
        </Button>
      </CardContent>
    </Card>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
