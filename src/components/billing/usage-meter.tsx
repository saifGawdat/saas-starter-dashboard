"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UsageMeterProps {
  label: string
  current: number
  limit: number | null
  unit?: string
  formatValue?: (value: number) => string
}

export function UsageMeter({
  label,
  current,
  limit,
  unit = "",
  formatValue,
}: UsageMeterProps) {
  const percentUsed = limit ? Math.min(Math.round((current / limit) * 100), 100) : 0
  const isNearLimit = percentUsed >= 80
  const isAtLimit = percentUsed >= 100

  const displayCurrent = formatValue ? formatValue(current) : current.toLocaleString()
  const displayLimit = limit
    ? formatValue
      ? formatValue(limit)
      : limit.toLocaleString()
    : "Unlimited"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {displayCurrent}
          {unit && ` ${unit}`} / {displayLimit}
          {unit && limit ? ` ${unit}` : ""}
        </span>
      </div>
      {limit !== null && (
        <Progress
          value={percentUsed}
          className={cn(
            "h-2",
            isAtLimit && "[&>div]:bg-red-500",
            isNearLimit && !isAtLimit && "[&>div]:bg-yellow-500"
          )}
        />
      )}
      {limit === null && (
        <div className="h-2 rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-green-500/30" />
        </div>
      )}
    </div>
  )
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
