import { db } from "@/db/drizzle";
import { pageViews } from "@/db/schema";
import { type NextRequest, NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import { trackEventSchema } from "@/lib/validations/track";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const ratelimit = rateLimit(ip, 100, 60 * 1000, "track-api"); // 100 requests per minute

  if (!ratelimit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": ratelimit.limit.toString(),
          "X-RateLimit-Remaining": ratelimit.remaining.toString(),
          "X-RateLimit-Reset": ratelimit.reset.toString(),
        },
      },
    );
  }

  const bodyJson = await req.json();

  const validation = trackEventSchema.safeParse(bodyJson);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 },
    );
  }

  const body = validation.data;

  // Fetch all required data from analytics.js
  const parser = new UAParser(req.headers.get("user-agent") || "");
  const deviceInfo = parser.getDevice()?.model || "Unknown Device";
  const osInfo = parser.getOS()?.name || "Unknown OS";
  const browserInfo = parser.getBrowser()?.name || "Unknown Browser";
  const visitorIp =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "";

  // Fetch geolocation data based on IP
  const geoRes = await fetch(`https://free.freeipapi.com/api/json/${visitorIp}`);
  const geoInfo = await geoRes.json();

  let result;

  if (body?.type === "entry") {
    result = await db
      .insert(pageViews)
      .values({
        clientId: body.clientId,
        websiteId: body.websiteId,
        domain: body.domain,
        url: body.url,
        type: body.type,
        referrer: body.referrer,
        entryTime: body.entryTime || new Date().toISOString(),
        exitTime: body.exitTime,
        totalActiveTime: body.totalActiveTime,
        urlParams: body.urlParams,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmTerm: body.utmTerm,
        utmContent: body.utmContent,
        device: deviceInfo,
        os: osInfo,
        browser: browserInfo,
        city: geoInfo.cityName,
        region: geoInfo.regionName,
        country: geoInfo.countryName,
        countryCode: geoInfo.countryCode,
        refParams: body.refParams,
      })
      .returning();
  } else {
    await db
      .update(pageViews)
      .set({
        exitTime: body.exitTime || new Date().toISOString(),
        totalActiveTime: body.totalActiveTime,
        exitUrl: body.exitUrl,
      })
      .where(
        and(
          eq(pageViews.clientId, body?.clientId),
          eq(pageViews.websiteId, body?.websiteId),
        ),
      )
      .returning();
  }

  return NextResponse.json({
    message: "Data received successfully",
    data: result,
  });
}
