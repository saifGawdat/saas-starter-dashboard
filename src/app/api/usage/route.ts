import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAllLimitsAndUsage } from "@/lib/usage/limits"
import { syncStorageUsage } from "@/lib/usage/tracker"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sync storage usage first
    await syncStorageUsage(session.user.id)

    // Get all limits and usage
    const usage = await getAllLimitsAndUsage(session.user.id)

    return NextResponse.json({ usage })
  } catch (error) {
    console.error("Error fetching usage:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    )
  }
}
