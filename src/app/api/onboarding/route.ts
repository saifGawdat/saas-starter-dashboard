import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { isFeatureEnabled } from "@/lib/features"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if onboarding feature is enabled
    const isEnabled = await isFeatureEnabled("onboarding_tour")
    if (!isEnabled) {
      return NextResponse.json({
        completedSteps: [],
        tourCompleted: true, // Skip tour if feature disabled
        tourSkipped: true,
        checklistHidden: true,
      })
    }

    // Get or create onboarding state
    let onboarding = await db.userOnboarding.findUnique({
      where: { userId: session.user.id },
    })

    if (!onboarding) {
      onboarding = await db.userOnboarding.create({
        data: {
          userId: session.user.id,
          completedSteps: [],
        },
      })
    }

    return NextResponse.json({
      completedSteps: onboarding.completedSteps as string[],
      tourCompleted: onboarding.tourCompleted,
      tourSkipped: onboarding.tourSkipped,
      checklistHidden: onboarding.checklistHidden,
    })
  } catch (error) {
    console.error("Error fetching onboarding:", error)
    return NextResponse.json(
      { error: "Failed to fetch onboarding state" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { completedSteps, tourCompleted, tourSkipped, checklistHidden } = body

    const data: Record<string, unknown> = {}
    if (completedSteps !== undefined) data.completedSteps = completedSteps
    if (tourCompleted !== undefined) data.tourCompleted = tourCompleted
    if (tourSkipped !== undefined) data.tourSkipped = tourSkipped
    if (checklistHidden !== undefined) data.checklistHidden = checklistHidden

    const onboarding = await db.userOnboarding.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        completedSteps: completedSteps || [],
        tourCompleted: tourCompleted || false,
        tourSkipped: tourSkipped || false,
        checklistHidden: checklistHidden || false,
      },
    })

    return NextResponse.json({ success: true, onboarding })
  } catch (error) {
    console.error("Error updating onboarding:", error)
    return NextResponse.json(
      { error: "Failed to update onboarding state" },
      { status: 500 }
    )
  }
}
