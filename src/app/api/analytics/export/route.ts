import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { exportPageViews, exportGeoSummary, exportConversionEvents, type ExportFormat } from "@/lib/analytics/export"
import { isFeatureEnabled } from "@/lib/features"
import { PERMISSIONS } from "@/config/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.permissions?.includes(PERMISSIONS.ANALYTICS_EXPORT)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if advanced analytics feature is enabled
    const isEnabled = await isFeatureEnabled("advanced_analytics")
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Advanced analytics is not enabled" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "pageviews" // pageviews, geo, conversions
    const format = (searchParams.get("format") || "csv") as ExportFormat
    const days = parseInt(searchParams.get("days") || "30")

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let data: string
    let filename: string

    switch (type) {
      case "geo":
        data = await exportGeoSummary({ startDate, endDate, format })
        filename = `geo-analytics-${days}d.${format}`
        break
      case "conversions":
        data = await exportConversionEvents({ startDate, endDate, format })
        filename = `conversion-events-${days}d.${format}`
        break
      case "pageviews":
      default:
        data = await exportPageViews({ startDate, endDate, format })
        filename = `page-views-${days}d.${format}`
        break
    }

    const contentType = format === "json" ? "application/json" : "text/csv"

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    )
  }
}
