import { db } from "@/lib/db"

export interface FunnelStep {
  step: number
  name: string
  count: number
  conversionRate: number
  dropoffRate: number
}

export interface FunnelData {
  name: string
  steps: FunnelStep[]
  overallConversion: number
}

/**
 * Default funnel definitions
 */
export const defaultFunnels = {
  signup: {
    name: "User Signup Funnel",
    steps: [
      { step: 1, eventType: "page_view_register" },
      { step: 2, eventType: "form_start_register" },
      { step: 3, eventType: "form_submit_register" },
      { step: 4, eventType: "signup_complete" },
    ],
  },
  subscription: {
    name: "Subscription Funnel",
    steps: [
      { step: 1, eventType: "page_view_pricing" },
      { step: 2, eventType: "plan_select" },
      { step: 3, eventType: "checkout_start" },
      { step: 4, eventType: "payment_complete" },
    ],
  },
  post_creation: {
    name: "Post Creation Funnel",
    steps: [
      { step: 1, eventType: "page_view_new_post" },
      { step: 2, eventType: "post_draft_saved" },
      { step: 3, eventType: "post_published" },
    ],
  },
}

/**
 * Get funnel analytics
 */
export async function getFunnelAnalytics(
  funnelName: keyof typeof defaultFunnels,
  startDate: Date,
  endDate: Date
): Promise<FunnelData> {
  const funnel = defaultFunnels[funnelName]

  const steps: FunnelStep[] = []
  let previousCount = 0

  for (const stepDef of funnel.steps) {
    const count = await db.conversionEvent.count({
      where: {
        eventType: stepDef.eventType,
        funnelStep: stepDef.step,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 100
    const dropoffRate = previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0

    steps.push({
      step: stepDef.step,
      name: formatEventTypeName(stepDef.eventType),
      count,
      conversionRate: Math.round(conversionRate * 10) / 10,
      dropoffRate: Math.round(dropoffRate * 10) / 10,
    })

    previousCount = count
  }

  const firstStep = steps[0]?.count || 0
  const lastStep = steps[steps.length - 1]?.count || 0
  const overallConversion = firstStep > 0 ? (lastStep / firstStep) * 100 : 0

  return {
    name: funnel.name,
    steps,
    overallConversion: Math.round(overallConversion * 10) / 10,
  }
}

/**
 * Track a conversion event
 */
export async function trackConversionEvent(
  eventType: string,
  funnelStep: number,
  userId?: string,
  sessionId?: string,
  metadata?: Record<string, unknown>
) {
  return db.conversionEvent.create({
    data: {
      eventType,
      funnelStep,
      userId,
      sessionId,
      metadata: metadata as any,
    },
  })
}

/**
 * Format event type name for display
 */
function formatEventTypeName(eventType: string): string {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
