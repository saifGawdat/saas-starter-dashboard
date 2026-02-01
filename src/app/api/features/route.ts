import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { PERMISSIONS } from "@/config/permissions"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const features = await db.featureFlag.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(features)
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.permissions?.includes(PERMISSIONS.FEATURES_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { key, name, description, isEnabled, requiresPlan, metadata } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: "Key and name are required" },
        { status: 400 }
      )
    }

    const feature = await db.featureFlag.create({
      data: {
        key,
        name,
        description,
        isEnabled: isEnabled ?? false,
        requiresPlan,
        metadata,
      },
    })

    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "feature_flag",
      entityId: feature.id,
      description: `Created feature flag: ${name}`,
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error("Error creating feature flag:", error)
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow admins to manage features (check role as fallback)
    const hasPermission = session.user.permissions?.includes(PERMISSIONS.FEATURES_MANAGE)
    const isAdmin = session.user.role === "Admin"

    if (!hasPermission && !isAdmin) {
      console.log("[Features API] Permission denied:", {
        role: session.user.role,
        permissions: session.user.permissions,
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { updates } = body // Array of { key, isEnabled }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      updates.map(async ({ key, isEnabled, requiresPlan }: { key: string; isEnabled?: boolean; requiresPlan?: string | null }) => {
        const data: { isEnabled?: boolean; requiresPlan?: string | null } = {}
        if (typeof isEnabled === "boolean") data.isEnabled = isEnabled
        if (requiresPlan !== undefined) data.requiresPlan = requiresPlan

        return db.featureFlag.update({
          where: { key },
          data,
        })
      })
    )

    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "feature_flag",
      description: `Updated ${updates.length} feature flag(s)`,
      metadata: { updates },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error updating feature flags:", error)
    return NextResponse.json(
      { error: "Failed to update feature flags" },
      { status: 500 }
    )
  }
}
