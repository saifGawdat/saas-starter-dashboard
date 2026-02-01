export const locales = [
  { code: "en", name: "English", direction: "ltr", region: "Global" },
  { code: "ar", name: "العربية", direction: "rtl", region: "Middle East" },
  { code: "zh", name: "中文", direction: "ltr", region: "China" },
  { code: "hi", name: "हिन्दी", direction: "ltr", region: "India" },
  { code: "ja", name: "日本語", direction: "ltr", region: "Japan" },
  { code: "de", name: "Deutsch", direction: "ltr", region: "Germany" },
  { code: "ru", name: "Русский", direction: "ltr", region: "Russia" },
  { code: "id", name: "Bahasa Indonesia", direction: "ltr", region: "Indonesia" },
  { code: "fr", name: "Français", direction: "ltr", region: "Canada" },
] as const

export type LocaleCode = (typeof locales)[number]["code"]
export type Direction = "ltr" | "rtl"

export const defaultLocale: LocaleCode = "en"

export const localeNames: Record<LocaleCode, string> = Object.fromEntries(
  locales.map((l) => [l.code, l.name])
) as Record<LocaleCode, string>

export const localeDirections: Record<LocaleCode, Direction> = Object.fromEntries(
  locales.map((l) => [l.code, l.direction])
) as Record<LocaleCode, Direction>

export function getLocaleDirection(locale: string): Direction {
  return localeDirections[locale as LocaleCode] || "ltr"
}

export function isRTL(locale: string): boolean {
  return getLocaleDirection(locale) === "rtl"
}

export function getLocale(code: string): (typeof locales)[number] | undefined {
  return locales.find((l) => l.code === code)
}

export function isValidLocale(code: string): code is LocaleCode {
  return locales.some((l) => l.code === code)
}
