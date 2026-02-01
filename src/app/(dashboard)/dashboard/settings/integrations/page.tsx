"use client"

import { useState, useEffect } from "react"
import { Loader2, CreditCard, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function IntegrationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<{
    configured: boolean
    hasSecretKey: boolean
    hasPublishableKey: boolean
    hasWebhookSecret: boolean
  } | null>(null)
  const [settings, setSettings] = useState({
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    tiktokPixelId: "",
    snapchatPixelId: "",
    customHeadScripts: "",
    customBodyScripts: "",
  })

  // Load existing settings and Stripe status
  useEffect(() => {
    fetch("/api/settings?group=integrations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const settingsMap: Record<string, string> = {}
          data.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value
          })
          setSettings((prev) => ({ ...prev, ...settingsMap }))
        }
      })
      .catch(() => {})

    // Check Stripe configuration status
    fetch("/api/stripe/status")
      .then((res) => res.json())
      .then((data) => setStripeStatus(data))
      .catch(() => setStripeStatus({ configured: false, hasSecretKey: false, hasPublishableKey: false, hasWebhookSecret: false }))
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "integrations",
          settings: Object.entries(settings).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Integration settings saved successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stripe Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Payment Integration
          </CardTitle>
          <CardDescription>
            Configure Stripe for payment processing and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stripeStatus === null ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking configuration...
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {stripeStatus.configured ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Configured
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Secret Key (STRIPE_SECRET_KEY)</span>
                  {stripeStatus.hasSecretKey ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Publishable Key (STRIPE_PUBLISHABLE_KEY)</span>
                  {stripeStatus.hasPublishableKey ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Webhook Secret (STRIPE_WEBHOOK_SECRET)</span>
                  {stripeStatus.hasWebhookSecret ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Get your API keys from the Stripe Dashboard</li>
                  <li>Add them to your <code className="bg-background px-1 rounded">.env</code> file</li>
                  <li>Restart the server to apply changes</li>
                </ol>
                <pre className="mt-3 bg-background p-2 rounded text-xs overflow-x-auto">
{`STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."`}
                </pre>
              </div>

              <Button variant="outline" asChild>
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Stripe Dashboard
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Connect your analytics services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your Google Analytics 4 measurement ID
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
            <Input
              id="googleTagManagerId"
              value={settings.googleTagManagerId}
              onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
              placeholder="GTM-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input
              id="facebookPixelId"
              value={settings.facebookPixelId}
              onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
              placeholder="XXXXXXXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokPixelId">TikTok Pixel ID</Label>
            <Input
              id="tiktokPixelId"
              value={settings.tiktokPixelId}
              onChange={(e) => setSettings({ ...settings, tiktokPixelId: e.target.value })}
              placeholder="XXXXXXXXXXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your TikTok Pixel ID from TikTok Events Manager
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="snapchatPixelId">Snapchat Pixel ID</Label>
            <Input
              id="snapchatPixelId"
              value={settings.snapchatPixelId}
              onChange={(e) => setSettings({ ...settings, snapchatPixelId: e.target.value })}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Your Snapchat Pixel ID from Snap Ads Manager
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Scripts</CardTitle>
          <CardDescription>Add custom JavaScript or tracking codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customHeadScripts">Head Scripts</Label>
            <Textarea
              id="customHeadScripts"
              value={settings.customHeadScripts}
              onChange={(e) => setSettings({ ...settings, customHeadScripts: e.target.value })}
              placeholder="<!-- Scripts to add before </head> -->"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Scripts that should be loaded in the &lt;head&gt; section
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customBodyScripts">Body Scripts</Label>
            <Textarea
              id="customBodyScripts"
              value={settings.customBodyScripts}
              onChange={(e) => setSettings({ ...settings, customBodyScripts: e.target.value })}
              placeholder="<!-- Scripts to add before </body> -->"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Scripts that should be loaded at the end of &lt;body&gt;
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
