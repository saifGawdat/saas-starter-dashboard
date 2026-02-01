import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { PERMISSIONS } from "@/config/permissions"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ invoices: [] })
    }

    return NextResponse.json({
      invoices: subscription.invoices,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}
