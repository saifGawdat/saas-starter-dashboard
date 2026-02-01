import { db } from "@/lib/db"
import { getUsage, type ResourceType } from "./tracker"
import { isFeatureEnabled } from "@/lib/features"

export interface PlanLimits {
  maxStorage: number | null // in GB, null = unlimited
  maxMediaUploads: number | null // per month, null = unlimited
  maxApiCalls: number | null // per month, null = unlimited
  maxPosts: number | null // per month, null = unlimited
}

export interface LimitCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number | null
  percentUsed: number
  message?: string
}

/**
 * Get the limits for a user based on their subscription plan
 */
export async function getUserLimits(userId: string): Promise<PlanLimits> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: {
      plan: {
        select: { features: true },
      },
    },
  })

  if (!subscription?.plan?.features) {
    // Return default free limits
    return {
      maxStorage: 1, // 1 GB
      maxMediaUploads: 50,
      maxApiCalls: 1000,
      maxPosts: 10,
    }
  }

  const features = subscription.plan.features as {
    maxStorage?: number | null
    maxMediaUploads?: number | null
    maxApiCalls?: number | null
    maxPosts?: number | null
  }

  return {
    maxStorage: features.maxStorage ?? null,
    maxMediaUploads: features.maxMediaUploads ?? null,
    maxApiCalls: features.maxApiCalls ?? null,
    maxPosts: features.maxPosts ?? null,
  }
}

/**
 * Check if a user can use a resource
 */
export async function checkLimit(
  userId: string,
  resourceType: ResourceType,
  additionalAmount: number = 1
): Promise<LimitCheckResult> {
  // Check if usage limits feature is enabled
  const limitsEnabled = await isFeatureEnabled("usage_limits")
  if (!limitsEnabled) {
    return {
      allowed: true,
      currentUsage: 0,
      limit: null,
      percentUsed: 0,
    }
  }

  const limits = await getUserLimits(userId)
  const currentUsage = await getUsage(userId, resourceType)

  let limit: number | null = null

  switch (resourceType) {
    case "storage":
      limit = limits.maxStorage ? limits.maxStorage * 1024 * 1024 * 1024 : null // Convert GB to bytes
      break
    case "media_uploads":
      limit = limits.maxMediaUploads
      break
    case "api_calls":
      limit = limits.maxApiCalls
      break
    case "posts":
      limit = limits.maxPosts
      break
  }

  // Unlimited
  if (limit === null) {
    return {
      allowed: true,
      currentUsage,
      limit: null,
      percentUsed: 0,
    }
  }

  const wouldBeUsage = currentUsage + additionalAmount
  const percentUsed = Math.round((currentUsage / limit) * 100)
  const allowed = wouldBeUsage <= limit

  return {
    allowed,
    currentUsage,
    limit,
    percentUsed,
    message: allowed
      ? undefined
      : `You've reached your ${resourceType.replace("_", " ")} limit. Upgrade your plan to continue.`,
  }
}

/**
 * Get all limits and usage for a user
 */
export async function getAllLimitsAndUsage(userId: string): Promise<{
  storage: LimitCheckResult
  media_uploads: LimitCheckResult
  api_calls: LimitCheckResult
  posts: LimitCheckResult
}> {
  const [storage, media_uploads, api_calls, posts] = await Promise.all([
    checkLimit(userId, "storage", 0),
    checkLimit(userId, "media_uploads", 0),
    checkLimit(userId, "api_calls", 0),
    checkLimit(userId, "posts", 0),
  ])

  return { storage, media_uploads, api_calls, posts }
}
