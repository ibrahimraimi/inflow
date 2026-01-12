import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { and, eq, gte, lte, sql, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { pageViews, websites } from "@/db/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "last_7_days";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Verify website ownership
    const website = await db
      .select()
      .from(websites)
      .where(
        and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
      );

    if (website.length === 0) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

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
        startDate = new Date(0); // 1970
        break;
      case "custom":
        if (fromParam) startDate = new Date(fromParam);
        if (toParam) endDate = new Date(toParam);
        break;
    }

    // Common Where Clause with Regex Check for YYYY-MM-DD
    const whereClause = and(
      eq(pageViews.websiteId, id),
      gte(pageViews.entryTime, startDate.toISOString()),
      lte(pageViews.entryTime, endDate.toISOString()),
      sql`${pageViews.entryTime} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`
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

    const chartDataResult: any = await db.execute(sql`
      SELECT 
        date_trunc(${dateTruncUnit}, (CASE WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp ELSE NULL END)) as date,
        count(*) as views,
        count(distinct "client_id") as visitors
      FROM ${pageViews}
      WHERE ${pageViews.websiteId} = ${id}
      AND "entry_time" >= ${startDate.toISOString()}
      AND "entry_time" <= ${endDate.toISOString()}
      AND "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const chartRows = chartDataResult.rows || chartDataResult;
    const chartData = chartRows.map((row: any) => ({
      date: row.date,
      views: Number(row.views),
      visitors: Number(row.visitors),
    }));

    // 3. Breakdowns (Tables)
    const getBreakdown = async (field: any) => {
      return await db
        .select({
          name: field,
          visitors: count(),
          uniqueVisitors: sql<number>`count(distinct ${pageViews.clientId})`,
        })
        .from(pageViews)
        .where(whereClause)
        .groupBy(field)
        .orderBy(desc(sql`count(*)`))
        .limit(10);
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
    ] = await Promise.all([
      getBreakdown(pageViews.url),
      getBreakdown(pageViews.referrer),
      getBreakdown(pageViews.browser),
      getBreakdown(pageViews.os),
      getBreakdown(pageViews.device),
      // Specialized breakdown for countries to include code
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
    ]);

    const formatBreakdown = (data: any[], total: number, type?: string) => {
      return data.map((item) => {
        let icon = null;
        const name = (item.name || "").toLowerCase();

        if (type === "country" && item.code) {
          icon = `https://flagsapi.com/${item.code.toUpperCase()}/flat/32.png`;
        } else if (type === "source" && item.name) {
          if (name.includes("google"))
            icon = "https://api.iconify.design/logos:google-icon.svg";
          else if (name.includes("twitter") || name.includes("t.co"))
            icon = "https://api.iconify.design/logos:twitter.svg";
          else if (name.includes("github"))
            icon = "https://api.iconify.design/logos:github-icon.svg";
          else if (name.includes("linkedin"))
            icon = "https://api.iconify.design/logos:linkedin-icon.svg";
          else if (name.includes("facebook"))
            icon = "https://api.iconify.design/logos:facebook.svg";
          else if (name.includes("instagram"))
            icon = "https://api.iconify.design/logos:instagram-icon.svg";
          else if (name.includes("youtube"))
            icon = "https://api.iconify.design/logos:youtube-icon.svg";
        } else if (type === "browser") {
          if (name.includes("chrome"))
            icon = "https://api.iconify.design/logos:chrome.svg";
          else if (name.includes("firefox"))
            icon = "https://api.iconify.design/logos:firefox.svg";
          else if (name.includes("safari"))
            icon = "https://api.iconify.design/logos:safari.svg";
          else if (name.includes("edge"))
            icon = "https://api.iconify.design/logos:microsoft-edge.svg";
          else if (name.includes("opera"))
            icon = "https://api.iconify.design/logos:opera.svg";
        } else if (type === "os") {
          if (name.includes("window"))
            icon = "https://api.iconify.design/logos:windows-11.svg";
          else if (name.includes("mac") || name.includes("os x"))
            icon = "https://api.iconify.design/logos:macos.svg";
          else if (name.includes("linux"))
            icon = "https://api.iconify.design/logos:linux-tux.svg";
          else if (name.includes("ios"))
            icon = "https://api.iconify.design/logos:ios.svg";
          else if (name.includes("android"))
            icon = "https://api.iconify.design/logos:android-icon.svg";
        } else if (type === "device") {
          if (name.includes("mobile") || name.includes("phone"))
            icon = "https://api.iconify.design/lucide:smartphone.svg";
          else if (name.includes("tablet"))
            icon = "https://api.iconify.design/lucide:tablet.svg";
          else icon = "https://api.iconify.design/lucide:monitor.svg";
        }

        return {
          ...item,
          icon,
          percentage:
            total > 0
              ? Math.round((Number(item.uniqueVisitors) / visitors) * 100)
              : 0,
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
    const trafficDataResult: any = await db.execute(sql`
      SELECT 
        extract(dow from (CASE WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp ELSE NULL END)) as day,
        extract(hour from (CASE WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp ELSE NULL END)) as hour,
        count(distinct "client_id") as visitors
      FROM ${pageViews}
      WHERE ${pageViews.websiteId} = ${id}
      AND "entry_time" >= ${startDate.toISOString()}
      AND "entry_time" <= ${endDate.toISOString()}
      AND "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      GROUP BY 1, 2
    `);

    const trafficRows = trafficDataResult.rows || trafficDataResult;
    const trafficData = trafficRows.map((row: any) => ({
      day: Number(row.day),
      hour: Number(row.hour),
      visitors: Number(row.visitors),
    }));

    return NextResponse.json({
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
      },
      map: mapDataResult,
      traffic: trafficData,
    });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
