import { db } from "@/lib/db"

export const DEFAULT_FEATURES = [
  {
    key: "realtime_notifications",
    name: "Real-time Notifications",
    description: "Enable Server-Sent Events for instant notification delivery",
    isEnabled: true,
  },
  {
    key: "push_notifications",
    name: "Browser Push Notifications",
    description: "Send push notifications to users' browsers when they're not on the site",
    isEnabled: false,
  },
  {
    key: "i18n",
    name: "Multi-language Support",
    description: "Enable internationalization with multiple languages and RTL support",
    isEnabled: false,
  },
  {
    key: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Geographic heatmaps, retention analysis, and conversion funnels",
    isEnabled: false,
  },
  {
    key: "stripe_billing",
    name: "Stripe Billing",
    description: "Enable Stripe integration for payments and subscription management",
    isEnabled: false,
  },
  {
    key: "usage_limits",
    name: "Usage Limits & Quotas",
    description: "Track and enforce resource usage limits per plan",
    isEnabled: false,
  },
  {
    key: "onboarding_tour",
    name: "Onboarding Tour",
    description: "Interactive guided tour for new users",
    isEnabled: true,
  },
] as const

export type FeatureKey = (typeof DEFAULT_FEATURES)[number]["key"]

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  try {
    const feature = await db.featureFlag.findUnique({
      where: { key },
    })
    return feature?.isEnabled ?? false
  } catch (error) {
    console.error(`Error checking feature ${key}:`, error)
    return false
  }
}

/**
 * Get all feature flags
 */
export async function getFeatureFlags() {
  try {
    const features = await db.featureFlag.findMany({
      orderBy: { name: "asc" },
    })
    return features
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return []
  }
}

/**
 * Get a specific feature flag
 */
export async function getFeatureFlag(key: FeatureKey) {
  try {
    const feature = await db.featureFlag.findUnique({
      where: { key },
    })
    return feature
  } catch (error) {
    console.error(`Error fetching feature ${key}:`, error)
    return null
  }
}

/**
 * Get multiple feature flags by keys
 */
export async function getFeatureFlagsByKeys(keys: FeatureKey[]) {
  try {
    const features = await db.featureFlag.findMany({
      where: {
        key: { in: keys },
      },
    })
    return Object.fromEntries(features.map((f) => [f.key, f.isEnabled]))
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return {}
  }
}

/**
 * Update a feature flag
 */
export async function updateFeatureFlag(
  key: FeatureKey,
  data: { isEnabled?: boolean; requiresPlan?: string | null; metadata?: Record<string, unknown> }
) {
  try {
    const feature = await db.featureFlag.update({
      where: { key },
      data: {
        ...data,
        metadata: data.metadata as any,
      },
    })
    return feature
  } catch (error) {
    console.error(`Error updating feature ${key}:`, error)
    return null
  }
}

/**
 * Initialize default feature flags
 * Should be called during seed or on first run
 */
export async function initializeFeatureFlags() {
  for (const feature of DEFAULT_FEATURES) {
    await db.featureFlag.upsert({
      where: { key: feature.key },
      update: {},
      create: {
        key: feature.key,
        name: feature.name,
        description: feature.description,
        isEnabled: feature.isEnabled,
      },
    })
  }
}

/**
 * Check if a feature requires a specific plan
 */
export async function checkFeatureAccess(
  key: FeatureKey,
  userPlanName?: string | null
): Promise<{ enabled: boolean; requiresPlan?: string }> {
  const feature = await getFeatureFlag(key)

  if (!feature) {
    return { enabled: false }
  }

  if (!feature.isEnabled) {
    return { enabled: false }
  }

  if (feature.requiresPlan && feature.requiresPlan !== userPlanName) {
    return { enabled: false, requiresPlan: feature.requiresPlan }
  }

  return { enabled: true }
}
