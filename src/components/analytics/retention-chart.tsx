"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

interface RetentionChartProps {
  data: RetentionData
}

const retentionLabels = ["Day 1", "Day 7", "Day 14", "Day 30"]

export function RetentionChart({ data }: RetentionChartProps) {
  const { cohorts, averageRetention } = data

  const getRetentionColor = (value: number): string => {
    if (value < 0) return "bg-muted"
    if (value >= 50) return "bg-green-500"
    if (value >= 30) return "bg-green-400"
    if (value >= 20) return "bg-yellow-400"
    if (value >= 10) return "bg-orange-400"
    return "bg-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Average Retention Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(averageRetention).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardDescription>
                {key.replace("day", "Day ")} Retention
              </CardDescription>
              <CardTitle className="text-2xl">
                {value > 0 ? `${value}%` : "N/A"}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
          <CardDescription>
            User retention by weekly signup cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cohorts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No retention data available yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Cohort</th>
                    <th className="text-center py-3 px-2 font-medium">Users</th>
                    {retentionLabels.map((label) => (
                      <th key={label} className="text-center py-3 px-2 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohortDate} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">
                        {formatDate(cohort.cohortDate)}
                      </td>
                      <td className="text-center py-3 px-2">
                        {cohort.totalUsers}
                      </td>
                      {cohort.retentionByDay.map((retention, i) => (
                        <td key={i} className="text-center py-3 px-2">
                          <span
                            className={cn(
                              "inline-block w-12 py-1 rounded text-xs font-medium",
                              getRetentionColor(retention),
                              retention >= 0 ? "text-white" : "text-muted-foreground"
                            )}
                          >
                            {retention >= 0 ? `${retention}%` : "—"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
