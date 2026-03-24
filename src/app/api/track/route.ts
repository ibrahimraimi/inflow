import crypto from "crypto";
import { db } from "@/db/drizzle";
import { pageViews, events, apiKeys, websites, apiKeyUsageLogs } from "@/db/schema";
import { type NextRequest, NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import { trackEventSchema } from "@/lib/validations/track";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing or invalid API key. Use Authorization: Bearer <apiKey>" },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const bodyJson = await req.json().catch(() => ({}));

    // 1. Validate API key
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const keyRecord = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.keyHash, keyHash),
    });

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // 2. Log usage
    try {
      await db.insert(apiKeyUsageLogs).values({
        id: crypto.randomUUID(),
        apiKeyId: keyRecord.id,
        endpoint: "/api/track",
        method: "POST",
        status: 200,
      });
    } catch (e) {
      console.error("Failed to log API key usage:", e);
    }

    // 3. Verify website ownership
    const website = await db.query.websites.findFirst({
      where: and(
        eq(websites.websiteId, bodyJson.websiteId),
        eq(websites.userId, keyRecord.userId)
      ),
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or unauthorized" },
        { status: 403, headers: CORS_HEADERS },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const ratelimit = await rateLimit(ip, 100, 60 * 1000, "track-api"); // 100 requests per minute

    if (!ratelimit.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            "X-RateLimit-Limit": ratelimit.limit.toString(),
            "X-RateLimit-Remaining": ratelimit.remaining.toString(),
            "X-RateLimit-Reset": ratelimit.reset.toString(),
          },
        },
      );
    }

    const validation = trackEventSchema.safeParse(bodyJson);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.format() },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const body = validation.data;

    // Fetch all required data from headers/UA
    const parser = new UAParser(req.headers.get("user-agent") || "");
    const deviceInfo = parser.getDevice()?.model || "Unknown Device";
    const osInfo = parser.getOS()?.name || "Unknown OS";
    const browserInfo = parser.getBrowser()?.name || "Unknown Browser";

    // Get geolocation from headers if available
    const geoInfo = {
      cityName: req.headers.get("x-vercel-ip-city") || "Unknown",
      regionName: req.headers.get("x-vercel-ip-country-region") || "Unknown",
      countryName: req.headers.get("x-vercel-ip-country") || "Unknown",
      countryCode: req.headers.get("x-vercel-ip-country-code") || "Unknown",
    };

    const visitorIp = ip.trim();
    // Validate IP string format against malicious SSRF inputs
    const isIpValid = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(visitorIp);

    const getGeoData = async () => {
      if (geoInfo.cityName !== "Unknown") return geoInfo;
      if (!isIpValid) return geoInfo;
      try {
        const geoRes = await fetch(`https://free.freeipapi.com/api/json/${visitorIp}`);
        return await geoRes.json();
      } catch (e) {
        return geoInfo;
      }
    };

    const finalGeo = await getGeoData();

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
          city: finalGeo.cityName || finalGeo.city || "Unknown",
          region: finalGeo.regionName || finalGeo.region || "Unknown",
          country: finalGeo.countryName || finalGeo.country || "Unknown",
          countryCode: finalGeo.countryCode || "Unknown",
          refParams: body.refParams,
        })
        .returning();
    } else if (body?.type === "event") {
      result = await db
        .insert(events)
        .values({
          clientId: body.clientId,
          websiteId: body.websiteId,
          eventName: body.eventName || "unknown",
          properties: body.properties ? body.properties : undefined,
        })
        .returning();
    } else {
      // type === "exit" or "ping"
      const updateData: Partial<typeof pageViews.$inferInsert> = {
        totalActiveTime: body.totalActiveTime,
      };

      if (body?.type === "exit") {
        updateData.exitTime = body.exitTime || new Date().toISOString();
        updateData.exitUrl = body.exitUrl;
      }

      result = await db
        .update(pageViews)
        .set(updateData)
        .where(
          body.pageViewId
            ? and(
                eq(pageViews.id, body.pageViewId),
                eq(pageViews.clientId, body.clientId!),
                eq(pageViews.websiteId, body.websiteId!)
              )
            : and(
                eq(pageViews.clientId, body?.clientId),
                eq(pageViews.websiteId, body?.websiteId),
              ),
        )
        .returning();
    }

    return NextResponse.json({
      message: "Data received successfully",
      data: result,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
