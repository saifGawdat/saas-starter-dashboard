"use client"

import { useState, useEffect } from "react"
import { History, Loader2, Search, Filter } from "lucide-react"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

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

export default function ActivityTimelinePage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")

  useEffect(() => {
    fetchActivities(1, true)
  }, [actionFilter, entityFilter])

  const fetchActivities = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
      })

      if (actionFilter !== "all") {
        params.set("action", actionFilter)
      }
      if (entityFilter !== "all") {
        params.set("entity", entityFilter)
      }

      const response = await fetch(`/api/activity?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data = await response.json()

      if (reset) {
        setActivities(data.logs)
      } else {
        setActivities((prev) => [...prev, ...data.logs])
      }

      setPage(pageNum)
      setHasMore(data.logs.length === 20)
    } catch (error) {
      toast.error("Failed to load activity log")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchActivities(page + 1)
    }
  }

  const filteredActivities = activities.filter((activity) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      activity.description?.toLowerCase().includes(searchLower) ||
      activity.user?.name?.toLowerCase().includes(searchLower) ||
      activity.user?.email.toLowerCase().includes(searchLower) ||
      activity.entity.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Activity Timeline
        </h1>
        <p className="text-muted-foreground">
          Visual timeline of all activity in your dashboard
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
              <SelectItem value="role">Role</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <ActivityTimeline activities={filteredActivities} />

          {/* Load More */}
          {hasMore && filteredActivities.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
