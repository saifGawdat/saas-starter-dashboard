import { db } from "@/lib/db"

export interface GeoData {
  country: string
  visitors: number
  percentage: number
}

export interface GeoStats {
  topCountries: GeoData[]
  totalVisitors: number
  uniqueCountries: number
}

/**
 * Get geographic analytics data
 */
export async function getGeoAnalytics(
  startDate: Date,
  endDate: Date
): Promise<GeoStats> {
  const pageViews = await db.pageView.groupBy({
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
    take: 20,
  })

  const totalVisitors = await db.pageView.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      country: {
        not: null,
      },
    },
  })

  const uniqueCountries = await db.pageView.groupBy({
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
  })

  const topCountries: GeoData[] = pageViews.map((pv) => ({
    country: pv.country || "Unknown",
    visitors: pv._count.id,
    percentage: totalVisitors > 0 ? (pv._count.id / totalVisitors) * 100 : 0,
  }))

  return {
    topCountries,
    totalVisitors,
    uniqueCountries: uniqueCountries.length,
  }
}

/**
 * Country code to name mapping
 */
export const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  AU: "Australia",
  RU: "Russia",
  KR: "South Korea",
  IT: "Italy",
  ES: "Spain",
  MX: "Mexico",
  NL: "Netherlands",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  SG: "Singapore",
  ID: "Indonesia",
}

export function getCountryName(code: string): string {
  return countryNames[code.toUpperCase()] || code
}
