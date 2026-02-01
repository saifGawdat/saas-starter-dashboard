import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { isValidLocale } from "@/lib/i18n/config"

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { locale } = body

    if (!locale || !isValidLocale(locale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { locale },
    })

    return NextResponse.json({ success: true, locale })
  } catch (error) {
    console.error("Error updating locale:", error)
    return NextResponse.json(
      { error: "Failed to update locale" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { locale: true },
    })

    return NextResponse.json({ locale: user?.locale || "en" })
  } catch (error) {
    console.error("Error fetching locale:", error)
    return NextResponse.json(
      { error: "Failed to fetch locale" },
      { status: 500 }
    )
  }
}
