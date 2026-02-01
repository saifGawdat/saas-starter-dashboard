import { create } from "zustand"
import { type LocaleCode, defaultLocale, getLocaleDirection } from "@/lib/i18n/config"

type TranslationMessages = Record<string, Record<string, string>>

interface TranslationsState {
  locale: LocaleCode
  messages: TranslationMessages
  isLoading: boolean
  isLoaded: boolean
  setLocale: (locale: LocaleCode) => Promise<void>
  loadTranslations: (locale: LocaleCode) => Promise<void>
  t: (key: string, params?: Record<string, string>) => string
}

// Cache for loaded translations
const translationsCache: Record<string, TranslationMessages> = {}

export const useTranslationsStore = create<TranslationsState>((set, get) => ({
  locale: defaultLocale,
  messages: {},
  isLoading: false,
  isLoaded: false,

  setLocale: async (locale: LocaleCode) => {
    await get().loadTranslations(locale)
    set({ locale })

    // Update document direction
    const direction = getLocaleDirection(locale)
    document.documentElement.dir = direction
    document.documentElement.lang = locale

    // Save to localStorage
    localStorage.setItem("user-locale", locale)
  },

  loadTranslations: async (locale: LocaleCode) => {
    // Check cache first
    if (translationsCache[locale]) {
      set({ messages: translationsCache[locale], isLoaded: true })
      return
    }

    set({ isLoading: true })

    try {
      const response = await fetch(`/messages/${locale}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`)
      }

      const messages = await response.json()
      translationsCache[locale] = messages
      set({ messages, isLoaded: true })
    } catch (error) {
      console.error("Failed to load translations:", error)
      // Fallback to English if loading fails
      if (locale !== "en" && !translationsCache["en"]) {
        try {
          const enResponse = await fetch("/messages/en.json")
          const enMessages = await enResponse.json()
          translationsCache["en"] = enMessages
          set({ messages: enMessages, isLoaded: true })
        } catch {
          set({ messages: {}, isLoaded: true })
        }
      }
    } finally {
      set({ isLoading: false })
    }
  },

  t: (key: string, params?: Record<string, string>) => {
    const { messages } = get()

    // Key format: "namespace.key" e.g., "common.save"
    const [namespace, ...keyParts] = key.split(".")
    const actualKey = keyParts.join(".")

    let translation = messages[namespace]?.[actualKey] || key

    // Replace params like {name} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, "g"), value)
      })
    }

    return translation
  },
}))

// Hook for easier usage
export function useTranslation() {
  const { t, locale, isLoaded } = useTranslationsStore()
  return { t, locale, isLoaded }
}
