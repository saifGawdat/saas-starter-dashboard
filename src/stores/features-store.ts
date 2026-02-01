import { create } from "zustand"
import { type FeatureKey } from "@/lib/features"

interface FeatureFlag {
  key: string
  name: string
  isEnabled: boolean
}

interface FeaturesState {
  features: FeatureFlag[]
  isLoading: boolean
  isLoaded: boolean
  fetchFeatures: () => Promise<void>
  isFeatureEnabled: (key: FeatureKey) => boolean
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  features: [],
  isLoading: false,
  isLoaded: false,

  fetchFeatures: async () => {
    if (get().isLoaded || get().isLoading) return

    set({ isLoading: true })
    try {
      const response = await fetch("/api/features")
      if (response.ok) {
        const data = await response.json()
        // API returns array directly, not { features: [...] }
        set({ features: Array.isArray(data) ? data : [], isLoaded: true })
      }
    } catch (error) {
      console.error("Failed to fetch features:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  isFeatureEnabled: (key: FeatureKey) => {
    const feature = get().features.find((f) => f.key === key)
    return feature?.isEnabled ?? false
  },
}))
