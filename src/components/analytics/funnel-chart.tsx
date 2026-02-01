"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  const { name, steps, overallConversion } = data
  const maxCount = Math.max(...steps.map((s) => s.count), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Conversion through each step</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Overall Conversion</div>
            <div className="text-2xl font-bold">{overallConversion}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No funnel data available yet
          </p>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const widthPercent = (step.count / maxCount) * 100
              const isLast = index === steps.length - 1

              return (
                <div key={step.step}>
                  {/* Step bar */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{step.name}</span>
                        <span className="text-muted-foreground">
                          {step.count.toLocaleString()} users
                        </span>
                      </div>
                      <div className="h-8 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dropoff indicator */}
                  {!isLast && step.dropoffRate > 0 && (
                    <div className="ml-12 flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <ArrowDown className="h-4 w-4" />
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>
                        {step.dropoffRate}% drop-off (
                        {Math.round((step.count * step.dropoffRate) / 100)} users)
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
