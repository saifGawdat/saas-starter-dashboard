"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CreditCard, ExternalLink, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Plan {
  id: string
  name: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number
  features: {
    maxUsers?: number | null
    maxStorage?: number | null
    maxApiCalls?: number | null
    featureFlags?: string[]
  }
  isPopular: boolean
}

interface Subscription {
  id: string
  planId: string
  status: string
  billingPeriod: string
  currentPeriodEnd: string
  plan: {
    name: string
  }
}

function BillingSearchParamsHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Successfully subscribed!")
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled")
    }
  }, [searchParams])

  return null
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/subscriptions/me"),
      ])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
      }

      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription(subData.subscription || null)
      }
    } catch (error) {
      toast.error("Failed to load billing data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingPeriod }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout")
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed")
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to open portal")
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open portal")
    } finally {
      setPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <BillingSearchParamsHandler />
      </Suspense>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.billingPeriod} billing • Renews{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant={subscription.status === "ACTIVE" ? "default" : "secondary"}
              >
                {subscription.status}
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              billingPeriod === "MONTHLY"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => setBillingPeriod("MONTHLY")}
          >
            Monthly
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              billingPeriod === "YEARLY"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => setBillingPeriod("YEARLY")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const price =
            billingPeriod === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice
          const isCurrentPlan = subscription?.planId === plan.id

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative",
                plan.isPopular && "border-primary shadow-lg"
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${Number(price)}</span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === "YEARLY" ? "year" : "month"}
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.maxUsers && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {plan.features.maxUsers === null
                        ? "Unlimited users"
                        : `Up to ${plan.features.maxUsers} users`}
                    </li>
                  )}
                  {plan.features.maxStorage && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {plan.features.maxStorage === null
                        ? "Unlimited storage"
                        : `${plan.features.maxStorage}GB storage`}
                    </li>
                  )}
                  {plan.features.featureFlags?.map((flag) => (
                    <li key={flag} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {formatFeatureFlag(flag)}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "default"}
                  disabled={isCurrentPlan || checkoutLoading === plan.id || Number(price) === 0}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {checkoutLoading === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrentPlan
                    ? "Current Plan"
                    : Number(price) === 0
                    ? "Free"
                    : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function formatFeatureFlag(flag: string): string {
  return flag
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
