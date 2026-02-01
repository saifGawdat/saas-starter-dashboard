"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslationsStore } from "@/stores/translations-store"
import { type LocaleCode, defaultLocale, isValidLocale, getLocaleDirection } from "@/lib/i18n/config"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setLocale, loadTranslations, isLoaded } = useTranslationsStore()

  useEffect(() => {
    const initLocale = async () => {
      // Priority: 1. User's saved locale from session, 2. localStorage, 3. browser, 4. default
      let locale: LocaleCode = defaultLocale

      // Check localStorage first (for quick initial load)
      const storedLocale = localStorage.getItem("user-locale")
      if (storedLocale && isValidLocale(storedLocale)) {
        locale = storedLocale as LocaleCode
      }

      // If authenticated, use user's saved locale from DB
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch("/api/user/locale")
          if (response.ok) {
            const data = await response.json()
            if (data.locale && isValidLocale(data.locale)) {
              locale = data.locale as LocaleCode
            }
          }
        } catch {
          // Use localStorage or default
        }
      }

      // Load translations and set direction
      await loadTranslations(locale)

      // Set document direction and lang
      const direction = getLocaleDirection(locale)
      document.documentElement.dir = direction
      document.documentElement.lang = locale

      // Update store locale
      useTranslationsStore.setState({ locale })
    }

    initLocale()
  }, [status, session, loadTranslations])

  // Show children even while loading translations
  return <>{children}</>
}
