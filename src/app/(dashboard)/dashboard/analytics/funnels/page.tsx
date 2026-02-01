"use client"

import { useState, useEffect } from "react"
import { GitBranch, Loader2 } from "lucide-react"
import { FunnelChart } from "@/components/analytics/funnel-chart"
import { ExportButton } from "@/components/analytics/export-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface FunnelStep {
  step: number
  name: string
  count: number
  conversionRate: number
  dropoffRate: number
}

interface FunnelData {
  name: string
  steps: FunnelStep[]
  overallConversion: number
}

const funnelOptions = [
  { value: "signup", label: "Signup Funnel" },
  { value: "subscription", label: "Subscription Funnel" },
  { value: "post_creation", label: "Post Creation Funnel" },
]

export default function FunnelsAnalyticsPage() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [funnel, setFunnel] = useState("signup")
  const [days, setDays] = useState("30")

  useEffect(() => {
    fetchData()
  }, [funnel, days])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/funnels?funnel=${funnel}&days=${days}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Advanced analytics is not enabled or you don't have permission")
        }
        throw new Error("Failed to fetch funnel data")
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load funnel analytics")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Conversion Funnels
          </h1>
          <p className="text-muted-foreground">
            Analyze user conversion through key flows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={funnel} onValueChange={setFunnel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {funnelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <ExportButton type="conversions" days={parseInt(days)} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <FunnelChart data={data} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Failed to load funnel data
        </div>
      )}
    </div>
  )
}
