import { db } from "@/lib/db"

export type ResourceType = "storage" | "media_uploads" | "api_calls" | "posts"

/**
 * Get the current billing period start and end dates
 */
export function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * Track resource usage for a user
 */
export async function trackUsage(
  userId: string,
  resourceType: ResourceType,
  amount: number
): Promise<void> {
  const { start, end } = getCurrentPeriod()

  await db.usageRecord.upsert({
    where: {
      userId_resourceType_periodStart: {
        userId,
        resourceType,
        periodStart: start,
      },
    },
    update: {
      amount: {
        increment: amount,
      },
    },
    create: {
      userId,
      resourceType,
      amount,
      periodStart: start,
      periodEnd: end,
    },
  })
}

/**
 * Get current usage for a user and resource type
 */
export async function getUsage(
  userId: string,
  resourceType: ResourceType
): Promise<number> {
  const { start } = getCurrentPeriod()

  const record = await db.usageRecord.findUnique({
    where: {
      userId_resourceType_periodStart: {
        userId,
        resourceType,
        periodStart: start,
      },
    },
  })

  return record ? Number(record.amount) : 0
}

/**
 * Get all usage for a user in the current period
 */
export async function getAllUsage(userId: string): Promise<Record<ResourceType, number>> {
  const { start } = getCurrentPeriod()

  const records = await db.usageRecord.findMany({
    where: {
      userId,
      periodStart: start,
    },
  })

  const usage: Record<ResourceType, number> = {
    storage: 0,
    media_uploads: 0,
    api_calls: 0,
    posts: 0,
  }

  for (const record of records) {
    usage[record.resourceType as ResourceType] = Number(record.amount)
  }

  return usage
}

/**
 * Calculate storage usage for a user (in bytes)
 */
export async function calculateStorageUsage(userId: string): Promise<number> {
  const result = await db.media.aggregate({
    where: { uploadedBy: userId },
    _sum: { fileSize: true },
  })

  return result._sum.fileSize || 0
}

/**
 * Recalculate and update storage usage
 */
export async function syncStorageUsage(userId: string): Promise<void> {
  const storageBytes = await calculateStorageUsage(userId)
  const { start, end } = getCurrentPeriod()

  await db.usageRecord.upsert({
    where: {
      userId_resourceType_periodStart: {
        userId,
        resourceType: "storage",
        periodStart: start,
      },
    },
    update: {
      amount: storageBytes,
    },
    create: {
      userId,
      resourceType: "storage",
      amount: storageBytes,
      periodStart: start,
      periodEnd: end,
    },
  })
}
