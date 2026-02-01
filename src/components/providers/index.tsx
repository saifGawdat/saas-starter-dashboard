"use client"

import { ThemeProvider } from "./theme-provider"
import { SessionProvider } from "./session-provider"
import { FaviconLoader } from "./favicon-provider"
import { AnalyticsProvider } from "./analytics-provider"
import { SSEProvider } from "./sse-provider"
import { TourProvider } from "./tour-provider"
import { I18nProvider } from "./i18n-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">
          <SSEProvider>
            <TourProvider>
              {children}
            </TourProvider>
          </SSEProvider>
          <FaviconLoader />
          <AnalyticsProvider />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </I18nProvider>
    </SessionProvider>
  )
}
