"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Check, Globe, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { locales, type LocaleCode } from "@/lib/i18n/config"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function LanguageSettingsPage() {
  const { data: session, update } = useSession()
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    // Fetch current locale
    fetch("/api/user/locale")
      .then((res) => res.json())
      .then((data) => {
        if (data.locale) {
          setCurrentLocale(data.locale)
        }
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [])

  const handleLocaleChange = async (locale: LocaleCode) => {
    if (locale === currentLocale) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/locale", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })

      if (!response.ok) {
        throw new Error("Failed to update language")
      }

      setCurrentLocale(locale)
      localStorage.setItem("user-locale", locale)

      // Update session
      await update({ locale })

      toast.success("Language updated successfully")

      // Reload to apply changes
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      toast.error("Failed to update language")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Choose your preferred language. The dashboard will be displayed in the selected language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locales.map((locale) => (
              <Button
                key={locale.code}
                variant="outline"
                className={cn(
                  "h-auto flex-col items-start gap-1 p-4 text-left",
                  locale.code === currentLocale && "border-primary bg-primary/5"
                )}
                onClick={() => handleLocaleChange(locale.code)}
                disabled={isLoading}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "font-medium",
                      locale.direction === "rtl" && "font-arabic"
                    )}
                  >
                    {locale.name}
                  </span>
                  {locale.code === currentLocale && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {locale.region} • {locale.direction.toUpperCase()}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RTL Support</CardTitle>
          <CardDescription>
            Right-to-left languages like Arabic are fully supported with proper text direction and layout mirroring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Current direction:{" "}
              <span className="font-medium text-foreground">
                {locales.find((l) => l.code === currentLocale)?.direction === "rtl"
                  ? "Right-to-Left (RTL)"
                  : "Left-to-Right (LTR)"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
