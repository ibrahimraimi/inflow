import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { toZonedTime } from "date-fns-tz";
import { db } from "@/db/drizzle";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { pageViews, websites } from "@/db/schema";
import {
  getSafeTimeZone,
  formatDateInTz,
  getDomainName,
  formatCountries,
  formatCities,
  formatRegions,
  formatReferrals,
  formatWithImage,
} from "@/lib/helpers";
import type { WebsiteWithAnalytics } from "@/configs/types";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { websiteId, websiteName, domain, timeZone, enableLocalhostTracking } =
    await req.json();

  // Check if domain already exists
  const existingDomain = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.domain, domain), eq(websites.userId, session.user.id))
    );

  if (existingDomain.length > 0) {
    return NextResponse.json({
      message: "Domain already exists!",
      data: existingDomain,
    });
  }

  const result = await db
    .insert(websites)
    .values({
      websiteId: websiteId,
      websiteName: websiteName,
      domain: domain,
      timeZone: timeZone,
      enableLocalhostTracking: enableLocalhostTracking,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json(result, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const websiteId = searchParams.get("websiteId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const websiteOnly = searchParams.get("websiteOnly");

  const fromUnix = from
    ? Math.floor(new Date(`${from}T00:00:00`).getTime() / 1000)
    : null;
  const toUnix = to
    ? Math.floor(new Date(`${to}T23:59:59`).getTime() / 1000)
    : null;

  /* IF WEBSITE ONLY */
  if (websiteOnly === "true") {
    let query = db
      .select()
      .from(websites)
      .where(eq(websites.userId, session.user.id));

    if (websiteId) {
      // If specific website requested
      const specificSite = await db
        .select()
        .from(websites)
        .where(
          and(
            eq(websites.userId, session.user.id),
            eq(websites.websiteId, websiteId)
          )
        );
      return NextResponse.json(specificSite[0]);
    }

    const allSites = await query.orderBy(desc(websites.id));
    return NextResponse.json(allSites);
  }

  /* FETCH WEBSITES */
  const userWebsites = await db
    .select()
    .from(websites)
    .where(
      websiteId
        ? and(
            eq(websites.userId, session.user.id),
            eq(websites.websiteId, websiteId)
          )
        : eq(websites.userId, session.user.id)
    )
    .orderBy(desc(websites.id));

  const result: WebsiteWithAnalytics[] = [];

  /* LOOP WEBSITES & AGGREGATE DATA */
  for (const site of userWebsites) {
    const siteTZ = getSafeTimeZone(site.timeZone);

    const views = await db
      .select()
      .from(pageViews)
      .where(
        and(
          eq(pageViews.websiteId, site.websiteId),
          ...(fromUnix && toUnix
            ? [
                gte(sql`${pageViews.entryTime}::bigint`, fromUnix),
                lte(sql`${pageViews.entryTime}::bigint`, toUnix),
              ]
            : [])
        )
      );

    const makeSetMap = () => ({}) as Record<string, Set<string>>;

    const countryVisitors = makeSetMap();
    const cityVisitors = makeSetMap();
    const regionVisitors = makeSetMap();
    const deviceVisitors = makeSetMap();
    const osVisitors = makeSetMap();
    const browserVisitors = makeSetMap();
    const referralVisitors = makeSetMap();
    const refParamsVisitors = makeSetMap();
    const utmSourceVisitors = makeSetMap();
    const urlVisitors = makeSetMap();

    const countryCodeMap: Record<string, string> = {};
    const cityCountryMap: Record<string, string> = {};
    const regionCountryMap: Record<string, string> = {};

    const uniqueVisitors = new Set<string>();
    let totalActiveTime = 0;

    views.forEach((v) => {
      if (!v.clientId) return;
      uniqueVisitors.add(v.clientId);

      if (v.totalActiveTime && v.totalActiveTime > 0) {
        totalActiveTime += v.totalActiveTime;
      }

      const add = (map: Record<string, Set<string>>, key: string) => {
        map[key] ??= new Set();
        map[key].add(v.clientId!);
      };

      if (v.country) {
        add(countryVisitors, v.country);
        if (v.countryCode)
          countryCodeMap[v.country] = v.countryCode.toUpperCase();
      }

      if (v.city) {
        add(cityVisitors, v.city);
        if (v.countryCode) cityCountryMap[v.city] = v.countryCode.toUpperCase();
      }

      if (v.region) {
        add(regionVisitors, v.region);
        if (v.countryCode)
          regionCountryMap[v.region] = v.countryCode.toUpperCase();
      }

      if (v.device) add(deviceVisitors, v.device);
      if (v.os) add(osVisitors, v.os);
      if (v.browser) add(browserVisitors, v.browser);
      if (v.referrer) add(referralVisitors, v.referrer);
      if (v.refParams) add(refParamsVisitors, v.refParams);
      if (v.utmSource) add(utmSourceVisitors, v.utmSource);
      if (v.url) add(urlVisitors, v.url);
    });

    const toCountMap = (map: Record<string, Set<string>>) =>
      Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.size]));

    const totalVisitors = uniqueVisitors.size;
    const totalSessions = views.length;
    const avgActiveTime =
      totalVisitors > 0 ? Math.round(totalActiveTime / totalVisitors) : 0;

    /* HOURLY VISITORS */
    const hourlyMap: Record<string, Set<string>> = {};
    const hourlyVisitors: WebsiteWithAnalytics["analytics"]["hourlyVisitors"] =
      [];

    if (views.length > 0) {
      const start = fromUnix
        ? new Date(fromUnix * 1000)
        : new Date(Math.min(...views.map((v) => Number(v.entryTime) * 1000)));
      const end = toUnix
        ? new Date(toUnix * 1000)
        : new Date(Math.max(...views.map((v) => Number(v.entryTime) * 1000)));

      let cursor = new Date(start);

      // Prevent infinite loop if dates are invalid
      if (cursor <= end) {
        // Limit loop to reasonable number of hours approx 1 year to be safe
        let safetyCount = 0;
        while (cursor <= end && safetyCount < 24 * 366) {
          const date = formatDateInTz(cursor, siteTZ);
          const hour = cursor.getHours();
          const key = `${date}-${hour}`;
          const hourLabel = cursor.toLocaleString("en-US", {
            hour: "numeric",
            hour12: true,
            timeZone: siteTZ,
          });

          hourlyVisitors.push({
            date,
            hour,
            hourLabel,
            count: 0,
          });

          hourlyMap[key] = new Set();
          cursor.setHours(cursor.getHours() + 1);
          safetyCount++;
        }
      }

      views.forEach((v) => {
        if (!v.entryTime || !v.clientId) return;
        const local = toZonedTime(new Date(Number(v.entryTime) * 1000), siteTZ);
        const date = formatDateInTz(local, siteTZ);
        hourlyMap[`${date}-${local.getHours()}`]?.add(v.clientId);
      });

      hourlyVisitors.forEach((h) => {
        h.count = hourlyMap[`${h.date}-${h.hour}`]?.size || 0;
      });
    }

    /* DAILY VISITORS */
    const dailyMap: Record<string, Set<string>> = {};

    views.forEach((v) => {
      if (!v.entryTime || !v.clientId) return;
      const local = toZonedTime(new Date(Number(v.entryTime) * 1000), siteTZ);
      const date = formatDateInTz(local, siteTZ);
      dailyMap[date] ??= new Set();
      dailyMap[date].add(v.clientId);
    });

    const dailyVisitors = Object.entries(dailyMap).map(([date, set]) => ({
      date,
      count: set.size,
    }));

    /* LAST 24H VISITORS */
    const last24hViews = views.filter((v) => {
      if (!v.entryTime) return false;
      const entryTime = Number(v.entryTime);
      const now = Math.floor(Date.now() / 1000);
      return entryTime >= now - 24 * 60 * 60;
    });

    const last24hUniqueVisitors = new Set(
      last24hViews.map((v) => v.clientId).filter(Boolean)
    ).size;

    result.push({
      website: site,
      analytics: {
        totalVisitors,
        totalSessions,
        totalActiveTime,
        avgActiveTime,
        hourlyVisitors,
        countries: formatCountries(toCountMap(countryVisitors), countryCodeMap),
        cities: formatCities(toCountMap(cityVisitors), cityCountryMap),
        regions: formatRegions(toCountMap(regionVisitors), regionCountryMap),
        referrals: formatReferrals(toCountMap(referralVisitors)),
        browsers: formatWithImage(toCountMap(browserVisitors)),
        os: formatWithImage(toCountMap(osVisitors)),
        devices: formatWithImage(toCountMap(deviceVisitors)),
        last24hVisitors: last24hUniqueVisitors,
      },
    });
  }

  return NextResponse.json(result);
}
