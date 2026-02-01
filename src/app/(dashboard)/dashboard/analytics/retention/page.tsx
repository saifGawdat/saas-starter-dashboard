"use client"

import { useState, useEffect } from "react"
import { Users, Loader2 } from "lucide-react"
import { RetentionChart } from "@/components/analytics/retention-chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface RetentionCohort {
  cohortDate: string
  totalUsers: number
  retentionByDay: number[]
}

interface RetentionData {
  cohorts: RetentionCohort[]
  averageRetention: {
    day1: number
    day7: number
    day14: number
    day30: number
  }
}

export default function RetentionAnalyticsPage() {
  const [data, setData] = useState<RetentionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [weeks, setWeeks] = useState("8")

  useEffect(() => {
    fetchData()
  }, [weeks])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/retention?weeks=${weeks}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Advanced analytics is not enabled or you don't have permission")
        }
        throw new Error("Failed to fetch retention data")
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load retention analytics")
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
            <Users className="h-8 w-8" />
            Retention Analytics
          </h1>
          <p className="text-muted-foreground">
            Track how well you retain users over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={weeks} onValueChange={setWeeks}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 weeks</SelectItem>
              <SelectItem value="8">8 weeks</SelectItem>
              <SelectItem value="12">12 weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <RetentionChart data={data} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Failed to load retention data
        </div>
      )}
    </div>
  )
}
