import { create } from "zustand"

interface OnboardingState {
  // Tour state
  isTourActive: boolean
  currentStep: number
  totalSteps: number

  // Checklist state
  completedSteps: string[]
  isChecklistVisible: boolean
  tourCompleted: boolean
  tourSkipped: boolean

  // Actions
  startTour: () => void
  endTour: () => void
  skipTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setTotalSteps: (total: number) => void

  completeChecklistItem: (id: string) => void
  hideChecklist: () => void
  showChecklist: () => void

  // Data loading
  loadOnboardingState: (data: {
    completedSteps: string[]
    tourCompleted: boolean
    tourSkipped: boolean
    checklistHidden: boolean
  }) => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  isTourActive: false,
  currentStep: 0,
  totalSteps: 8,
  completedSteps: [],
  isChecklistVisible: true,
  tourCompleted: false,
  tourSkipped: false,

  // Tour actions
  startTour: () => set({ isTourActive: true, currentStep: 0 }),

  endTour: () => {
    set({ isTourActive: false, tourCompleted: true })
    // Persist to server
    fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourCompleted: true }),
    }).catch(console.error)
  },

  skipTour: () => {
    set({ isTourActive: false, tourSkipped: true })
    // Persist to server
    fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourSkipped: true }),
    }).catch(console.error)
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 })
    } else {
      get().endTour()
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  goToStep: (step: number) => {
    const { totalSteps } = get()
    if (step >= 0 && step < totalSteps) {
      set({ currentStep: step })
    }
  },

  setTotalSteps: (total: number) => set({ totalSteps: total }),

  // Checklist actions
  completeChecklistItem: (id: string) => {
    const { completedSteps } = get()
    if (!completedSteps.includes(id)) {
      const newCompletedSteps = [...completedSteps, id]
      set({ completedSteps: newCompletedSteps })

      // Persist to server
      fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedSteps: newCompletedSteps }),
      }).catch(console.error)
    }
  },

  hideChecklist: () => {
    set({ isChecklistVisible: false })
    fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklistHidden: true }),
    }).catch(console.error)
  },

  showChecklist: () => set({ isChecklistVisible: true }),

  // Load state from server
  loadOnboardingState: (data) => {
    set({
      completedSteps: data.completedSteps || [],
      tourCompleted: data.tourCompleted,
      tourSkipped: data.tourSkipped,
      isChecklistVisible: !data.checklistHidden,
    })
  },
}))
