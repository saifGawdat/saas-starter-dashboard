"use client"

import { formatDistanceToNow } from "date-fns"
import {
  FileEdit,
  FilePlus,
  Trash2,
  UserPlus,
  Settings,
  LogIn,
  LogOut,
  Upload,
  Eye,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActivityLog {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: Date | string
  user?: {
    name: string | null
    email: string
    image: string | null
  } | null
}

interface TimelineGroup {
  date: string
  activities: ActivityLog[]
}

interface ActivityTimelineProps {
  activities: ActivityLog[]
}

const actionIcons: Record<string, React.ElementType> = {
  created: FilePlus,
  updated: FileEdit,
  deleted: Trash2,
  published: Send,
  signup: UserPlus,
  login: LogIn,
  logout: LogOut,
  uploaded: Upload,
  viewed: Eye,
  settings: Settings,
}

const actionColors: Record<string, string> = {
  created: "bg-green-500",
  updated: "bg-blue-500",
  deleted: "bg-red-500",
  published: "bg-purple-500",
  signup: "bg-emerald-500",
  login: "bg-cyan-500",
  logout: "bg-gray-500",
  uploaded: "bg-orange-500",
  viewed: "bg-slate-500",
  settings: "bg-amber-500",
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Group activities by date
  const groupedActivities = groupByDate(activities)

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No activity recorded yet
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupedActivities.map((group) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="sticky top-0 z-10 -mx-4 bg-background/95 backdrop-blur px-4 py-2 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {formatDateHeader(group.date)}
            </h3>
          </div>

          {/* Timeline */}
          <div className="relative pl-8 space-y-6">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

            {group.activities.map((activity, index) => {
              const Icon = actionIcons[activity.action] || FileEdit
              const color = actionColors[activity.action] || "bg-gray-500"
              const isExpanded = expandedItems.has(activity.id)
              const hasMetadata = activity.metadata && Object.keys(activity.metadata).length > 0

              return (
                <div key={activity.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full",
                      color
                    )}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </div>

                  {/* Activity card */}
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* User avatar */}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={activity.user?.image || undefined} />
                          <AvatarFallback>
                            {activity.user?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium">
                              {activity.user?.name || "Unknown User"}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {activity.action}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {activity.entity}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Time and expand */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {hasMetadata && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpand(activity.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded metadata */}
                    {isExpanded && hasMetadata && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          DETAILS
                        </h4>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                        {activity.ipAddress && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            IP: {activity.ipAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByDate(activities: ActivityLog[]): TimelineGroup[] {
  const groups: Record<string, ActivityLog[]> = {}

  for (const activity of activities) {
    const date = new Date(activity.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
  }

  return Object.entries(groups).map(([date, activities]) => ({
    date,
    activities,
  }))
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  })
}
