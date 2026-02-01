"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useOnboardingStore } from "@/stores/onboarding-store"
import { WelcomeModal } from "@/components/onboarding/welcome-modal"
import { tourSteps, type OnboardingStep } from "@/config/onboarding"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourProviderProps {
  children: React.ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const { data: session, status } = useSession()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleSteps, setVisibleSteps] = useState<OnboardingStep[]>([])

  const {
    isTourActive,
    currentStep,
    tourCompleted,
    tourSkipped,
    loadOnboardingState,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    setTotalSteps,
  } = useOnboardingStore()

  // Fetch onboarding state on mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/onboarding")
        .then((res) => res.json())
        .then((data) => {
          loadOnboardingState(data)

          // Show welcome modal for new users
          if (!data.tourCompleted && !data.tourSkipped) {
            setShowWelcome(true)
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [status, session?.user?.id, loadOnboardingState])

  // Filter tour steps based on visible elements when tour starts
  useEffect(() => {
    if (isTourActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const filtered = tourSteps.filter((step) => {
          // Always include steps without an element selector (welcome/complete screens)
          if (!step.element) return true
          // Only include steps where the element exists in the DOM
          return document.querySelector(step.element) !== null
        })
        setVisibleSteps(filtered)
        setTotalSteps(filtered.length)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isTourActive, setTotalSteps])

  // Highlight current element
  useEffect(() => {
    if (!isTourActive || visibleSteps.length === 0) return

    const step = visibleSteps[currentStep]
    if (!step?.element) return

    const element = document.querySelector(step.element)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("tour-highlight")
    }

    return () => {
      if (element) {
        element.classList.remove("tour-highlight")
      }
    }
  }, [isTourActive, currentStep, visibleSteps])

  const currentTourStep = visibleSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === visibleSteps.length - 1

  if (isLoading || status !== "authenticated") {
    return <>{children}</>
  }

  return (
    <>
      {children}

      {/* Welcome Modal */}
      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      {/* Tour Overlay */}
      {isTourActive && visibleSteps.length > 0 && (
        <>
          {/* Tour Tooltip */}
          <div
            className={cn(
              "fixed z-[10000] w-80 rounded-lg border bg-card p-4 shadow-2xl",
              getTooltipPosition(currentTourStep)
            )}
          >
            {/* Step indicator */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {visibleSteps.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={skipTour}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <h3 className="mb-2 font-semibold">{currentTourStep?.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {currentTourStep?.description}
            </p>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={isFirstStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button size="sm" onClick={isLastStep ? endTour : nextStep}>
                {isLastStep ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Progress dots */}
            <div className="mt-4 flex justify-center gap-1">
              {visibleSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    index === currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tour highlight styles */}
      <style jsx global>{`
        .tour-highlight {
          z-index: 9998 !important;
          outline: 4px solid hsl(var(--primary)) !important;
          outline-offset: 4px !important;
          animation: tour-pulse 2s ease-in-out infinite;
          border-radius: 8px;
        }

        @keyframes tour-pulse {
          0%, 100% {
            outline-color: hsl(var(--primary));
            outline-offset: 4px;
          }
          50% {
            outline-color: hsl(var(--primary) / 0.7);
            outline-offset: 6px;
          }
        }
      `}</style>
    </>
  )
}

function getTooltipPosition(step: typeof tourSteps[0] | undefined): string {
  if (!step?.element) {
    // Center for welcome/complete steps
    return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  }

  const position = step.position || "bottom"

  switch (position) {
    case "top":
      return "left-1/2 top-20 -translate-x-1/2"
    case "bottom":
      return "left-1/2 bottom-20 -translate-x-1/2"
    case "left":
      return "left-20 top-1/2 -translate-y-1/2"
    case "right":
      return "right-20 top-1/2 -translate-y-1/2"
    default:
      return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  }
}
