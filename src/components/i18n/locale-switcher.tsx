"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { Check, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, type LocaleCode } from "@/lib/i18n/config"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LocaleSwitcherProps {
  currentLocale?: string
  onLocaleChange?: (locale: LocaleCode) => void
}

export function LocaleSwitcher({ currentLocale = "en", onLocaleChange }: LocaleSwitcherProps) {
  const { data: session, update } = useSession()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = async (locale: LocaleCode) => {
    if (locale === currentLocale) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      try {
        // Update user's locale preference in the database
        const response = await fetch("/api/user/locale", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        })

        if (!response.ok) {
          throw new Error("Failed to update locale")
        }

        // Update session
        await update({ locale })

        // Store in localStorage for immediate effect
        localStorage.setItem("user-locale", locale)

        // Notify parent component
        onLocaleChange?.(locale)

        // Reload to apply changes
        window.location.reload()
      } catch (error) {
        toast.error("Failed to change language")
      }
    })

    setIsOpen(false)
  }

  const currentLocaleData = locales.find((l) => l.code === currentLocale) || locales[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{currentLocaleData.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={cn(
              "flex items-center justify-between",
              locale.code === currentLocale && "bg-accent"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={locale.direction === "rtl" ? "font-arabic" : ""}>
                {locale.name}
              </span>
              <span className="text-xs text-muted-foreground">({locale.region})</span>
            </div>
            {locale.code === currentLocale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
