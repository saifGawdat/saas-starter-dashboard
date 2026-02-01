"use client"

import { useState, useEffect } from "react"
import { Loader2, ToggleLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeatureToggle } from "@/components/settings/feature-toggle"
import { toast } from "sonner"

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  isEnabled: boolean
  requiresPlan: string | null
}

export default function FeaturesSettingsPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch("/api/features")
      if (!response.ok) throw new Error("Failed to fetch features")
      const data = await response.json()
      setFeatures(data)
    } catch (error) {
      toast.error("Failed to load feature flags")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (key: string, enabled: boolean) => {
    setUpdatingKeys((prev) => new Set(prev).add(key))

    // Optimistic update
    setFeatures((prev) =>
      prev.map((f) => (f.key === key ? { ...f, isEnabled: enabled } : f))
    )

    try {
      const response = await fetch("/api/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ key, isEnabled: enabled }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update feature (${response.status})`)
      }

      toast.success(`${enabled ? "Enabled" : "Disabled"} feature`)
    } catch (error) {
      // Revert on error
      setFeatures((prev) =>
        prev.map((f) => (f.key === key ? { ...f, isEnabled: !enabled } : f))
      )
      toast.error("Failed to update feature")
    } finally {
      setUpdatingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Group features by category
  const coreFeatures = features.filter((f) =>
    ["realtime_notifications", "push_notifications", "onboarding_tour"].includes(f.key)
  )
  const advancedFeatures = features.filter((f) =>
    ["i18n", "advanced_analytics"].includes(f.key)
  )
  const billingFeatures = features.filter((f) =>
    ["stripe_billing", "usage_limits"].includes(f.key)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Enable or disable features across your application. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Core Features
            </h3>
            <div className="space-y-3">
              {coreFeatures.map((feature) => (
                <FeatureToggle
                  key={feature.key}
                  name={feature.name}
                  description={feature.description}
                  isEnabled={feature.isEnabled}
                  requiresPlan={feature.requiresPlan}
                  onToggle={(enabled) => handleToggle(feature.key, enabled)}
                  disabled={updatingKeys.has(feature.key)}
                />
              ))}
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Advanced Features
            </h3>
            <div className="space-y-3">
              {advancedFeatures.map((feature) => (
                <FeatureToggle
                  key={feature.key}
                  name={feature.name}
                  description={feature.description}
                  isEnabled={feature.isEnabled}
                  requiresPlan={feature.requiresPlan}
                  onToggle={(enabled) => handleToggle(feature.key, enabled)}
                  disabled={updatingKeys.has(feature.key)}
                />
              ))}
            </div>
          </div>

          {/* Billing Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Billing & Monetization
            </h3>
            <div className="space-y-3">
              {billingFeatures.map((feature) => (
                <FeatureToggle
                  key={feature.key}
                  name={feature.name}
                  description={feature.description}
                  isEnabled={feature.isEnabled}
                  requiresPlan={feature.requiresPlan}
                  onToggle={(enabled) => handleToggle(feature.key, enabled)}
                  disabled={updatingKeys.has(feature.key)}
                />
              ))}
            </div>
          </div>

          {features.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No feature flags configured. Run database seed to initialize default features.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
