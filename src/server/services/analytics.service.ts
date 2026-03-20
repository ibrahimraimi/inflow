import { db } from "@/db/drizzle";
import { and, eq, gte, inArray, lte, sql, count, desc } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { pageViews, websites } from "@/db/schema";
import type {
  AnalyticsData,
  ChartData,
  MetricItem,
  TrafficData,
} from "@/configs/types";

export class AnalyticsService {
  static async getData(websiteIdOrAll: string, range: string, from?: string, to?: string, userId?: string): Promise<AnalyticsData> {
    // Calculate Date Range
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Helper to reset time to start of day
    const startOfDay = (d: Date) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };

    switch (range) {
      case "today":
        startDate = startOfDay(new Date());
        break;
      case "last_24_hours":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "this_week":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case "last_7_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "this_month":
        startDate = startOfDay(new Date());
        startDate.setDate(1);
        break;
      case "last_30_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "last_90_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "this_year":
        startDate = startOfDay(new Date());
        startDate.setMonth(0, 1);
        break;
      case "last_12_months":
        startDate = startOfDay(new Date());
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case "all_time":
        startDate = new Date(0); 
        break;
      case "custom":
        if (from) startDate = new Date(from);
        if (to) endDate = new Date(to);
        break;
      default:
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
    }

    // Normalizing entry_time
    const entryTimeAsTimestamp = sql`(CASE 
      WHEN ${pageViews.entryTime} ~ '^[0-9]+$' THEN to_timestamp(${pageViews.entryTime}::bigint)
      WHEN ${pageViews.entryTime} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN ${pageViews.entryTime}::timestamp
      ELSE NULL
    END)`;

    const baseWhere = websiteIdOrAll === "all" && userId
      ? inArray(pageViews.websiteId, db.select({ id: websites.websiteId }).from(websites).where(eq(websites.userId, userId)))
      : eq(pageViews.websiteId, websiteIdOrAll);

    const whereClause = and(
      baseWhere,
      gte(entryTimeAsTimestamp, startDate),
      lte(entryTimeAsTimestamp, endDate)
    );

    // 1. Metrics
    const [totalViewsResult, visitorsResult, bouncesResult, durationResult] =
      await Promise.all([
        db.select({ count: count() }).from(pageViews).where(whereClause),
        db
          .select({ count: sql<number>`count(distinct ${pageViews.clientId})` })
          .from(pageViews)
          .where(whereClause),
        db
          .select({ count: count() })
          .from(pageViews)
          .where(
            and(
              whereClause,
              sql`(${pageViews.totalActiveTime} < 5 OR ${pageViews.totalActiveTime} IS NULL)`
            )
          ),
        db
          .select({ avg: sql<number>`avg(${pageViews.totalActiveTime})` })
          .from(pageViews)
          .where(whereClause),
      ]);

    const totalViews = totalViewsResult[0]?.count || 0;
    const visitors = visitorsResult[0]?.count || 0;
    const bounces = bouncesResult[0]?.count || 0;
    const duration = durationResult[0]?.avg || 0;
    const bounceRate = totalViews > 0 ? (bounces / totalViews) * 100 : 0;

    // 2. Chart Data (Time Series)
    const isHourly = range === "today" || range === "last_24_hours";
    const dateTruncUnit = isHourly ? "hour" : "day";

    const chartDataResult = await db.execute(sql`
      SELECT 
        date_trunc(${dateTruncUnit}, (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END)) as date,
        count(*) as views,
        count(distinct "client_id") as visitors
      FROM ${pageViews}
      WHERE ${
        websiteIdOrAll === "all" && userId
          ? sql`${pageViews.websiteId} IN (SELECT "website_id" FROM ${websites} WHERE ${websites.userId} = ${userId})`
          : sql`${pageViews.websiteId} = ${websiteIdOrAll}`
      }
      AND (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END) >= ${startDate.toISOString()}::timestamp
      AND (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END) <= ${endDate.toISOString()}::timestamp
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const chartRows = (chartDataResult.rows ||
      chartDataResult) as unknown as Array<{
      date: string;
      views: string | number;
      visitors: string | number;
    }>;
    const chartData: ChartData[] = chartRows.map((row) => ({
      date: row.date,
      views: Number(row.views),
      visitors: Number(row.visitors),
    }));

    // 3. Breakdowns (Tables)
    const getBreakdown = async (field: PgColumn) => {
      return (await db
        .select({
          name: field,
          visitors: count(),
          uniqueVisitors: sql<number>`count(distinct ${pageViews.clientId})`,
        })
        .from(pageViews)
        .where(whereClause)
        .groupBy(field)
        .orderBy(desc(sql`count(*)`))
        .limit(10)) as Array<{
        name: string | null;
        visitors: number;
        uniqueVisitors: number;
      }>;
    };

    const [
      pages,
      referrers,
      browsers,
      os,
      devices,
      countriesData,
      regions,
      cities,
      utmCampaigns,
      utmSources,
      utmMediums,
      domains,
    ] = await Promise.all([
      getBreakdown(pageViews.url),
      getBreakdown(pageViews.referrer),
      getBreakdown(pageViews.browser),
      getBreakdown(pageViews.os),
      getBreakdown(pageViews.device),
      db
        .select({
          name: pageViews.country,
          code: pageViews.countryCode,
          visitors: count(),
          uniqueVisitors: sql<number>`count(distinct ${pageViews.clientId})`,
        })
        .from(pageViews)
        .where(whereClause)
        .groupBy(pageViews.country, pageViews.countryCode)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
      getBreakdown(pageViews.region),
      getBreakdown(pageViews.city),
      getBreakdown(pageViews.utmCampaign),
      getBreakdown(pageViews.utmSource),
      getBreakdown(pageViews.utmMedium),
      getBreakdown(pageViews.domain),
    ]);

    const formatBreakdown = (
      data: Array<{
        name: string | null;
        visitors: number;
        uniqueVisitors: number;
        code?: string | null;
      }>,
      total: number,
      type?: string
    ): MetricItem[] => {
      return data.map((item) => {
        let icon = null;
        const name = (item.name || "").toLowerCase();

        if (type === "country" && item.code && item.code.toUpperCase() !== "UNKNOWN") {
          icon = `https://flagsapi.com/${item.code.toUpperCase()}/flat/32.png`;
        } else if (type === "country") {
          icon = "https://api.iconify.design/lucide:globe.svg";
        } else if (type === "source" && item.name) {
          if (name.includes("google")) icon = "https://api.iconify.design/logos:google-icon.svg";
          else if (name.includes("twitter") || name.includes("t.co")) icon = "https://api.iconify.design/logos:twitter.svg";
          else if (name.includes("github")) icon = "https://api.iconify.design/logos:github-icon.svg";
          else if (name.includes("linkedin")) icon = "https://api.iconify.design/logos:linkedin-icon.svg";
          else if (name.includes("facebook")) icon = "https://api.iconify.design/logos:facebook.svg";
          else if (name.includes("instagram")) icon = "https://api.iconify.design/logos:instagram-icon.svg";
          else if (name.includes("youtube")) icon = "https://api.iconify.design/logos:youtube-icon.svg";
        } else if (type === "browser") {
          if (name.includes("chrome")) icon = "https://api.iconify.design/logos:chrome.svg";
          else if (name.includes("firefox")) icon = "https://api.iconify.design/logos:firefox.svg";
          else if (name.includes("safari")) icon = "https://api.iconify.design/logos:safari.svg";
          else if (name.includes("edge")) icon = "https://api.iconify.design/logos:microsoft-edge.svg";
          else if (name.includes("opera")) icon = "https://api.iconify.design/logos:opera.svg";
        } else if (type === "os") {
          if (name.includes("window")) icon = "https://api.iconify.design/logos:windows-11.svg";
          else if (name.includes("mac") || name.includes("os x")) icon = "https://api.iconify.design/logos:macos.svg";
          else if (name.includes("linux")) icon = "https://api.iconify.design/logos:linux-tux.svg";
          else if (name.includes("ios")) icon = "https://api.iconify.design/logos:ios.svg";
          else if (name.includes("android")) icon = "https://api.iconify.design/logos:android-icon.svg";
        } else if (type === "device") {
          if (name.includes("mobile") || name.includes("phone")) icon = "https://api.iconify.design/lucide:smartphone.svg";
          else if (name.includes("tablet")) icon = "https://api.iconify.design/lucide:tablet.svg";
          else icon = "https://api.iconify.design/lucide:monitor.svg";
        }

        return {
          name: item.name || "Unknown",
          visitors: item.visitors,
          uniqueVisitors: item.uniqueVisitors,
          icon,
          percentage: total > 0 ? Math.round((item.uniqueVisitors / total) * 100) : 0,
        };
      });
    };

    // 4. Map Data
    const mapDataResult = await db
      .select({
        code: pageViews.countryCode,
        visitors: sql<number>`count(distinct ${pageViews.clientId})`,
      })
      .from(pageViews)
      .where(whereClause)
      .groupBy(pageViews.countryCode);

    // 5. Traffic Heatmap
    const trafficDataResult = await db.execute(sql`
      SELECT 
        extract(dow from (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END)) as day,
        extract(hour from (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END)) as hour,
        count(distinct "client_id") as visitors
      FROM ${pageViews}
      WHERE ${
        websiteIdOrAll === "all" && userId
          ? sql`${pageViews.websiteId} IN (SELECT "website_id" FROM ${websites} WHERE ${websites.userId} = ${userId})`
          : sql`${pageViews.websiteId} = ${websiteIdOrAll}`
      }
      AND (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END) >= ${startDate.toISOString()}::timestamp
      AND (CASE 
          WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
          WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
          ELSE NULL
        END) <= ${endDate.toISOString()}::timestamp
      GROUP BY 1, 2
    `);

    const trafficRows = (trafficDataResult.rows ||
      trafficDataResult) as unknown as Array<{
      day: string | number;
      hour: string | number;
      visitors: string | number;
    }>;
    const trafficData: TrafficData[] = trafficRows.map((row) => ({
      day: Number(row.day),
      hour: Number(row.hour),
      visitors: Number(row.visitors),
    }));

    return {
      metrics: {
        visitors,
        views: totalViews,
        visits: totalViews,
        bounceRate,
        duration,
      },
      chart: chartData,
      tables: {
        pages: formatBreakdown(pages, visitors),
        sources: formatBreakdown(referrers, visitors, "source"),
        browsers: formatBreakdown(browsers, visitors, "browser"),
        os: formatBreakdown(os, visitors, "os"),
        devices: formatBreakdown(devices, visitors, "device"),
        countries: formatBreakdown(countriesData, visitors, "country"),
        regions: formatBreakdown(regions, visitors),
        cities: formatBreakdown(cities, visitors),
        utmCampaigns: formatBreakdown(utmCampaigns, visitors),
        utmSources: formatBreakdown(utmSources, visitors, "source"),
        utmMediums: formatBreakdown(utmMediums, visitors),
        domains: formatBreakdown(domains, visitors, "domain"),
      },
      map: mapDataResult as Array<{ code: string; name?: string; visitors: number; }>,
      traffic: trafficData,
    };
  }
}
