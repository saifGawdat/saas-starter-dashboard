"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getCountryName } from "@/lib/analytics/geo"

interface GeoData {
  country: string
  visitors: number
  percentage: number
}

interface GeoMapProps {
  data: GeoData[]
  totalVisitors: number
  uniqueCountries: number
}

export function GeoMap({ data, totalVisitors, uniqueCountries }: GeoMapProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Visitors</CardDescription>
            <CardTitle className="text-3xl">{totalVisitors.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Countries</CardDescription>
            <CardTitle className="text-3xl">{uniqueCountries}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Country List */}
      <Card>
        <CardHeader>
          <CardTitle>Visitors by Country</CardTitle>
          <CardDescription>Top countries by visitor count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No geographic data available yet
              </p>
            ) : (
              data.map((item, index) => (
                <div key={item.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="font-medium">
                        {getCountryName(item.country)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({item.country})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {item.visitors.toLocaleString()} visitors
                      </span>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
