"use client"

import { useState, useEffect } from "react"
import { Globe, Loader2 } from "lucide-react"
import { GeoMap } from "@/components/analytics/geo-map"
import { ExportButton } from "@/components/analytics/export-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface GeoData {
  country: string
  visitors: number
  percentage: number
}

interface GeoStats {
  topCountries: GeoData[]
  totalVisitors: number
  uniqueCountries: number
}

export default function GeoAnalyticsPage() {
  const [data, setData] = useState<GeoStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState("30")

  useEffect(() => {
    fetchData()
  }, [days])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/geo?days=${days}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Advanced analytics is not enabled or you don't have permission")
        }
        throw new Error("Failed to fetch geo data")
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load geo analytics")
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
            <Globe className="h-8 w-8" />
            Geographic Analytics
          </h1>
          <p className="text-muted-foreground">
            Visitor distribution by country and region
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <ExportButton type="geo" days={parseInt(days)} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <GeoMap
          data={data.topCountries}
          totalVisitors={data.totalVisitors}
          uniqueCountries={data.uniqueCountries}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Failed to load geographic data
        </div>
      )}
    </div>
  )
}
