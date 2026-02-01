"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebarStore } from "@/stores/sidebar-store"
import { useFeaturesStore } from "@/stores/features-store"
import { useTranslation } from "@/stores/translations-store"
import { navigation, type NavGroup, type NavItem } from "@/config/navigation"
import { ChevronLeft, Sparkles } from "lucide-react"

// Map navigation item titles to translation keys
const navTranslationKeys: Record<string, string> = {
  "Dashboard": "navigation.dashboard",
  "Analytics": "navigation.analytics",
  "Geography": "navigation.geography",
  "Retention": "navigation.retention",
  "Funnels": "navigation.funnels",
  "Posts": "navigation.posts",
  "Categories": "navigation.categories",
  "Tags": "navigation.tags",
  "Media": "navigation.media",
  "SEO Settings": "navigation.seo",
  "Redirects": "navigation.redirects",
  "Plans": "navigation.plans",
  "Subscriptions": "navigation.subscriptions",
  "Overview": "navigation.overview",
  "Usage": "navigation.usage",
  "Invoices": "navigation.invoices",
  "Templates": "navigation.templates",
  "Logs": "navigation.logs",
  "Users": "navigation.users",
  "Roles": "navigation.roles",
  "Activity Log": "navigation.activity",
  "Timeline": "navigation.timeline",
  "Settings": "navigation.settings",
}

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebarStore()
  const { data: session, status } = useSession()
  const { features, isLoaded, fetchFeatures, isFeatureEnabled } = useFeaturesStore()
  const { t } = useTranslation()

  // Helper to get translated title
  const getTitle = (title: string) => {
    const key = navTranslationKeys[title]
    if (key) {
      const translated = t(key)
      // If translation returns the key itself, use original title
      return translated === key ? title : translated
    }
    return title
  }

  // Fetch features on mount
  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  // Filter navigation based on features and permissions
  const filteredNavigation = useMemo(() => {
    const userPermissions = session?.user?.permissions || []
    const isAuthenticated = status === "authenticated"
    const hasPermissions = userPermissions.length > 0

    return navigation
      .map((group): NavGroup | null => {
        // Check if the entire group requires a feature
        // Hide feature-gated groups until features are loaded
        if (group.feature) {
          if (!isLoaded) return null // Hide until loaded
          if (!isFeatureEnabled(group.feature)) return null
        }

        // Filter items within the group
        const filteredItems = group.items.filter((item) => {
          // Check feature flag
          // Hide feature-gated items until features are loaded
          if (item.feature) {
            if (!isLoaded) return false // Hide until loaded
            if (!isFeatureEnabled(item.feature)) return false
          }

          // Check permission
          // Hide permission-gated items until session is loaded
          if (item.permission) {
            if (status === "loading") return false // Hide until session loaded
            if (isAuthenticated && hasPermissions && !userPermissions.includes(item.permission)) {
              return false
            }
          }

          return true
        })

        // Don't show empty groups
        if (filteredItems.length === 0) {
          return null
        }

        return { ...group, items: filteredItems }
      })
      .filter((group): group is NavGroup => group !== null)
  }, [session, status, features, isLoaded, isFeatureEnabled])

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-tour="sidebar"
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-lg">Dashboard</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isCollapsed && "absolute -right-3 top-6 z-50 rounded-full border bg-background shadow-md"
              )}
              onClick={toggle}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <nav className="space-y-6 px-2 py-4">
              {filteredNavigation.map((group) => (
                <div key={group.title} className="space-y-1">
                  {!isCollapsed && (
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {getTitle(group.title)}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      // Check if this item is active
                      // Use exact match, but for dynamic routes (e.g., /posts/123) match parent
                      // Don't match parent if a more specific sibling route matches
                      const allHrefs = filteredNavigation.flatMap(g => g.items.map(i => i.href))
                      const hasMoreSpecificMatch = allHrefs.some(
                        href => href !== item.href && href.startsWith(item.href + "/") && pathname.startsWith(href)
                      )
                      const isActive = pathname === item.href ||
                        (!hasMoreSpecificMatch && pathname.startsWith(`${item.href}/`))
                      const Icon = item.icon

                      // Get data-tour attribute for onboarding
                      const getTourAttr = (title: string) => {
                        const tourMap: Record<string, string> = {
                          "Posts": "nav-posts",
                          "Media": "nav-media",
                          "Settings": "nav-settings",
                          "Users": "nav-users",
                          "Analytics": "nav-analytics",
                        }
                        return tourMap[title]
                      }

                      const navLink = (
                        <Link
                          key={item.href}
                          href={item.href}
                          data-tour={getTourAttr(item.title)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isCollapsed && "justify-center px-2"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{getTitle(item.title)}</span>
                              {item.badge && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      )

                      if (isCollapsed) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                              {navLink}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-2">
                              {getTitle(item.title)}
                              {item.badge && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return navLink
                    })}
                  </div>
                </div>
              ))}
            </nav>
            </ScrollArea>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
