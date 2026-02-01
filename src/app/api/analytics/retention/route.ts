import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRetentionAnalytics } from "@/lib/analytics/retention";
import { isFeatureEnabled } from "@/lib/features";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/config/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, PERMISSIONS.ANALYTICS_ADVANCED)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if advanced analytics feature is enabled
    const isEnabled = await isFeatureEnabled("advanced_analytics");
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Advanced analytics is not enabled" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const weeks = parseInt(searchParams.get("weeks") || "8");

    const data = await getRetentionAnalytics(weeks);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching retention analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch retention analytics" },
      { status: 500 },
    );
  }
}
