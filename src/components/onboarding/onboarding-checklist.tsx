"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronRight, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checklistItems } from "@/config/onboarding"
import { useOnboardingStore } from "@/stores/onboarding-store"
import { cn } from "@/lib/utils"

export function OnboardingChecklist() {
  const [isExpanded, setIsExpanded] = useState(true)
  const {
    completedSteps,
    isChecklistVisible,
    tourCompleted,
    tourSkipped,
    hideChecklist,
    completeChecklistItem,
  } = useOnboardingStore()

  const completedCount = completedSteps.length
  const totalCount = checklistItems.length
  const progress = (completedCount / totalCount) * 100
  const isComplete = completedCount === totalCount

  // Hide if checklist is hidden or all items are completed
  if (!isChecklistVisible || isComplete) {
    return null
  }

  // Don't show if tour hasn't been completed or skipped
  if (!tourCompleted && !tourSkipped) {
    return null
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Getting Started</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={hideChecklist}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const isCompleted = completedSteps.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-2 transition-colors",
                    isCompleted
                      ? "bg-primary/5"
                      : "hover:bg-muted cursor-pointer"
                  )}
                  onClick={() => {
                    if (!isCompleted && item.href) {
                      completeChecklistItem(item.id)
                    }
                  }}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isCompleted && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.href && !isCompleted ? (
                      <Link
                        href={item.href}
                        className="text-sm font-medium hover:underline"
                        onClick={() => completeChecklistItem(item.id)}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isCompleted && "text-muted-foreground line-through"
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                    <p
                      className={cn(
                        "text-xs text-muted-foreground",
                        isCompleted && "line-through"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
