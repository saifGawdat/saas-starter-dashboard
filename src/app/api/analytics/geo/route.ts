import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getGeoAnalytics } from "@/lib/analytics/geo"
import { isFeatureEnabled } from "@/lib/features"
import { PERMISSIONS } from "@/config/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.permissions?.includes(PERMISSIONS.ANALYTICS_ADVANCED)) {
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
    const days = parseInt(searchParams.get("days") || "30")

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const data = await getGeoAnalytics(startDate, endDate)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching geo analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch geo analytics" },
      { status: 500 }
    )
  }
}
