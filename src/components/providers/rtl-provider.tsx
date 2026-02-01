"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getLocaleDirection, type Direction } from "@/lib/i18n/config"

interface RTLProviderProps {
  children: React.ReactNode
  defaultLocale?: string
}

export function RTLProvider({ children, defaultLocale = "en" }: RTLProviderProps) {
  const { data: session } = useSession()
  const [direction, setDirection] = useState<Direction>("ltr")

  useEffect(() => {
    // Get locale from session or localStorage
    const locale =
      (session?.user as { locale?: string })?.locale ||
      localStorage.getItem("user-locale") ||
      defaultLocale

    const newDirection = getLocaleDirection(locale)
    setDirection(newDirection)

    // Update document direction
    document.documentElement.dir = newDirection
    document.documentElement.lang = locale

    // Add RTL-specific class for styling
    if (newDirection === "rtl") {
      document.documentElement.classList.add("rtl")
    } else {
      document.documentElement.classList.remove("rtl")
    }
  }, [session, defaultLocale])

  return (
    <div dir={direction} className={direction === "rtl" ? "rtl" : "ltr"}>
      {children}
    </div>
  )
}
