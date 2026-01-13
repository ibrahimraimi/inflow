import { db } from "@/db/drizzle";
import { pageViews } from "@/db/schema";
import { type NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("Data:", body);

  // Fetch all required data from analytics.js
  const parser = new UAParser(req.headers.get("user-agent") || "");
  const deviceInfo = parser.getDevice()?.model || "Unknown Device";
  const osInfo = parser.getOS()?.name || "Unknown OS";
  const browserInfo = parser.getBrowser()?.name || "Unknown Browser";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "";

  // Fetch geolocation data based on IP
  const geoRes = await fetch(`https://free.freeipapi.com/api/json/${ip}`);
  const geoInfo = await geoRes.json();

  console.log("Device Info:", deviceInfo);
  console.log("OS Info:", osInfo);
  console.log("Browser Info:", browserInfo);
  console.log("Geolocation Info:", geoInfo);

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
        entryTime: body.entryTime,
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
        exitTime: body.exitTime,
        totalActiveTime: body.totalActiveTime,
        exitUrl: body.exitUrl,
      })
      .where(eq(pageViews.clientId, body?.clientId))
      .returning();
  }

  console.log("Database Insertion Result:", result);

  return NextResponse.json({
    message: "Data received successfully",
    data: result,
  });
}
