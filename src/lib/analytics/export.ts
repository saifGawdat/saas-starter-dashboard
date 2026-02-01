import { db } from "@/lib/db"

export type ExportFormat = "csv" | "json"

export interface ExportOptions {
  startDate: Date
  endDate: Date
  format: ExportFormat
  includeFields?: string[]
}

/**
 * Export page view analytics data
 */
export async function exportPageViews(options: ExportOptions): Promise<string> {
  const { startDate, endDate, format } = options

  const pageViews = await db.pageView.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      path: true,
      sessionId: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      referrer: true,
      duration: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (format === "json") {
    return JSON.stringify(pageViews, null, 2)
  }

  // CSV format
  const headers = ["path", "session_id", "country", "city", "device", "browser", "referrer", "duration", "created_at"]
  const rows = pageViews.map((pv) => [
    escapeCsvValue(pv.path),
    escapeCsvValue(pv.sessionId),
    escapeCsvValue(pv.country),
    escapeCsvValue(pv.city),
    escapeCsvValue(pv.device),
    escapeCsvValue(pv.browser),
    escapeCsvValue(pv.referrer),
    pv.duration?.toString() || "",
    pv.createdAt.toISOString(),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

/**
 * Export geographic analytics summary
 */
export async function exportGeoSummary(options: ExportOptions): Promise<string> {
  const { startDate, endDate, format } = options

  const geoData = await db.pageView.groupBy({
    by: ["country"],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      country: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  })

  const data = geoData.map((d) => ({
    country: d.country,
    visitors: d._count.id,
  }))

  if (format === "json") {
    return JSON.stringify(data, null, 2)
  }

  // CSV format
  const headers = ["country", "visitors"]
  const rows = data.map((d) => [escapeCsvValue(d.country), d.visitors.toString()])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

/**
 * Export conversion events
 */
export async function exportConversionEvents(options: ExportOptions): Promise<string> {
  const { startDate, endDate, format } = options

  const events = await db.conversionEvent.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      eventType: true,
      funnelStep: true,
      sessionId: true,
      userId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (format === "json") {
    return JSON.stringify(events, null, 2)
  }

  // CSV format
  const headers = ["event_type", "funnel_step", "session_id", "user_id", "created_at"]
  const rows = events.map((e) => [
    escapeCsvValue(e.eventType),
    e.funnelStep.toString(),
    escapeCsvValue(e.sessionId),
    escapeCsvValue(e.userId),
    e.createdAt.toISOString(),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

/**
 * Escape CSV value
 */
function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
