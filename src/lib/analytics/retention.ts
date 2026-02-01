import { db } from "@/lib/db"

export interface RetentionCohort {
  cohortDate: string
  totalUsers: number
  retentionByDay: number[] // Percentage retained for days 1, 7, 14, 30
}

export interface RetentionData {
  cohorts: RetentionCohort[]
  averageRetention: {
    day1: number
    day7: number
    day14: number
    day30: number
  }
}

/**
 * Calculate user retention based on activity
 */
export async function getRetentionAnalytics(weeks: number = 8): Promise<RetentionData> {
  const cohorts: RetentionCohort[] = []
  const now = new Date()

  // Calculate retention for each week cohort
  for (let i = weeks - 1; i >= 0; i--) {
    const cohortStart = new Date(now)
    cohortStart.setDate(cohortStart.getDate() - (i + 1) * 7)
    cohortStart.setHours(0, 0, 0, 0)

    const cohortEnd = new Date(cohortStart)
    cohortEnd.setDate(cohortEnd.getDate() + 7)

    // Get users who signed up in this cohort
    const cohortUsers = await db.user.findMany({
      where: {
        createdAt: {
          gte: cohortStart,
          lt: cohortEnd,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    })

    if (cohortUsers.length === 0) {
      continue
    }

    const userIds = cohortUsers.map((u) => u.id)

    // Calculate retention for days 1, 7, 14, 30
    const retentionDays = [1, 7, 14, 30]
    const retentionByDay: number[] = []

    for (const days of retentionDays) {
      const targetDate = new Date(cohortStart)
      targetDate.setDate(targetDate.getDate() + days)

      if (targetDate > now) {
        retentionByDay.push(-1) // Not enough data yet
        continue
      }

      const targetEnd = new Date(targetDate)
      targetEnd.setDate(targetEnd.getDate() + 1)

      // Count users who were active on the target day
      const activeUsers = await db.pageView.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: userIds,
          },
          createdAt: {
            gte: targetDate,
            lt: targetEnd,
          },
        },
      })

      const retention = (activeUsers.length / cohortUsers.length) * 100
      retentionByDay.push(Math.round(retention * 10) / 10)
    }

    cohorts.push({
      cohortDate: cohortStart.toISOString().split("T")[0],
      totalUsers: cohortUsers.length,
      retentionByDay,
    })
  }

  // Calculate average retention
  const validCohorts = cohorts.filter((c) => c.retentionByDay.some((r) => r >= 0))
  const averageRetention = {
    day1: calculateAverage(validCohorts.map((c) => c.retentionByDay[0]).filter((r) => r >= 0)),
    day7: calculateAverage(validCohorts.map((c) => c.retentionByDay[1]).filter((r) => r >= 0)),
    day14: calculateAverage(validCohorts.map((c) => c.retentionByDay[2]).filter((r) => r >= 0)),
    day30: calculateAverage(validCohorts.map((c) => c.retentionByDay[3]).filter((r) => r >= 0)),
  }

  return { cohorts, averageRetention }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}
