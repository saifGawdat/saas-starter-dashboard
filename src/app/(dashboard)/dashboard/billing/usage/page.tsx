"use client"

import { useState, useEffect } from "react"
import { BarChart3, Loader2, HardDrive, Image, Zap, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsageMeter, formatBytes } from "@/components/billing/usage-meter"
import { UpgradePrompt } from "@/components/billing/upgrade-prompt"
import { toast } from "sonner"

interface LimitCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number | null
  percentUsed: number
  message?: string
}

interface UsageData {
  storage: LimitCheckResult
  media_uploads: LimitCheckResult
  api_calls: LimitCheckResult
  posts: LimitCheckResult
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/usage")
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (error) {
      toast.error("Failed to load usage data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasAnyLimit = usage && Object.values(usage).some(
    (u) => u.percentUsed >= 80
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Usage & Quotas
        </h1>
        <p className="text-muted-foreground">
          Monitor your resource usage and plan limits
        </p>
      </div>

      {/* Upgrade Prompt if near limit */}
      {hasAnyLimit && (
        <UpgradePrompt
          title="You're approaching your limits"
          description="Consider upgrading your plan to get more resources and unlock premium features."
        />
      )}

      {/* Usage Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Storage</CardTitle>
            </div>
            <CardDescription>Total file storage used</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && (
              <UsageMeter
                label="Storage Used"
                current={usage.storage.currentUsage}
                limit={usage.storage.limit}
                formatValue={formatBytes}
              />
            )}
          </CardContent>
        </Card>

        {/* Media Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Media Uploads</CardTitle>
            </div>
            <CardDescription>Files uploaded this month</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && (
              <UsageMeter
                label="Uploads"
                current={usage.media_uploads.currentUsage}
                limit={usage.media_uploads.limit}
                unit="files"
              />
            )}
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">API Calls</CardTitle>
            </div>
            <CardDescription>API requests this month</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && (
              <UsageMeter
                label="API Calls"
                current={usage.api_calls.currentUsage}
                limit={usage.api_calls.limit}
                unit="calls"
              />
            )}
          </CardContent>
        </Card>

        {/* Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Posts</CardTitle>
            </div>
            <CardDescription>Posts created this month</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && (
              <UsageMeter
                label="Posts"
                current={usage.posts.currentUsage}
                limit={usage.posts.limit}
                unit="posts"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Storage:</strong> Delete unused media files to free up space.
            Consider compressing images before uploading.
          </p>
          <p>
            <strong>API Calls:</strong> Use caching and batch requests to reduce
            API usage. Monitor third-party integrations for excessive calls.
          </p>
          <p>
            <strong>Posts:</strong> Draft posts don't count toward your limit
            until published.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
