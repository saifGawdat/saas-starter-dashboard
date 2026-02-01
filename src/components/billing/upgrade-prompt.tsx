"use client"

import { useState } from "react"
import { Zap, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

interface UpgradePromptProps {
  title?: string
  description?: string
  resourceType?: string
  onDismiss?: () => void
  dismissable?: boolean
}

export function UpgradePrompt({
  title = "Upgrade Your Plan",
  description = "You've reached your limit. Upgrade to continue using this feature.",
  resourceType,
  onDismiss,
  dismissable = true,
}: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="relative">
        {dismissable && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/billing">
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {dismissable && (
            <Button variant="ghost" onClick={handleDismiss}>
              Maybe Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Inline upgrade prompt for tight spaces
 */
export function InlineUpgradePrompt({
  message = "Limit reached",
}: {
  message?: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm">
      <Zap className="h-4 w-4 text-yellow-500" />
      <span className="flex-1">{message}</span>
      <Button variant="link" size="sm" className="h-auto p-0" asChild>
        <Link href="/dashboard/billing">Upgrade</Link>
      </Button>
    </div>
  )
}
