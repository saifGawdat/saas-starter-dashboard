"use client"

import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FeatureToggleProps {
  name: string
  description?: string | null
  isEnabled: boolean
  requiresPlan?: string | null
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}

export function FeatureToggle({
  name,
  description,
  isEnabled,
  requiresPlan,
  onToggle,
  disabled = false,
}: FeatureToggleProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors",
        isEnabled ? "border-primary/50 bg-primary/5" : "border-border"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{name}</h4>
          {requiresPlan && (
            <Badge variant="outline" className="text-xs">
              Requires {requiresPlan}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label={`Toggle ${name}`}
      />
    </div>
  )
}
