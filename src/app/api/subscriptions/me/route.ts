import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            monthlyPrice: true,
            yearlyPrice: true,
            features: true,
          },
        },
      },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
