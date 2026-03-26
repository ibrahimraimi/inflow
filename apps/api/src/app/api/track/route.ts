import crypto from "crypto";
import { LRUCache } from "lru-cache";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { auth } from "@inflow/core/lib/auth";
import { rateLimit } from "@inflow/core/lib/rate-limit";
import { trackEventSchema } from "@inflow/core/lib/validations/track";
import { pageViews, events, apiKeys, websites, apiKeyUsageLogs } from "@inflow/db";

// Global cache to persist across requests in the same isolate
const cache = new LRUCache<string, any>({
  max: 500, // max 500 items
  ttl: 1000 * 60 * 5, // 5 minutes cache
});

const CORS_HEADERS = (req: NextRequest) => {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS(req) });
}

/**
 * @swagger
 * /api/track:
 *   post:
 *     summary: Track website events and page views
 *     description: Ingests tracking data from the Inflow SDK or custom integrations.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [websiteId, clientId, type]
 *             properties:
 *               websiteId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               domain:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [entry, event, exit, ping]
 *               referrer:
 *                 type: string
 *               eventName:
 *                 type: string
 *               properties:
 *                 type: object
 *     responses:
 *       200:
 *         description: Data received successfully
 *       401:
 *         description: Unauthorized (Missing or invalid API key)
 *       403:
 *         description: Forbidden (Website not found or unauthorized)
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const cors = CORS_HEADERS(req);
    if (!apiKey) {
      // We don't return 401 yet, we will check session first
    }

    const bodyJson = await req.json().catch(() => ({}));

    let userId: string | null = null;
    let apiKeyId: string | null = null;
    let session: any = null;

    if (!apiKey) {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    }

    // 1. Validate API key or session caching
    let cacheKey = apiKey ? `apikey:${apiKey}` : `session:${session?.user?.id}`;
    let cachedAuth = cacheKey !== "session:undefined" ? cache.get(cacheKey) : null;

    if (cachedAuth) {
      userId = cachedAuth.userId;
      apiKeyId = cachedAuth.apiKeyId;
    } else {
      if (apiKey) {
        const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
        const keyRecord = await db.query.apiKeys.findFirst({
          where: eq(apiKeys.keyHash, keyHash),
        });

        if (keyRecord) {
          userId = keyRecord.userId;
          apiKeyId = keyRecord.id;
          cache.set(cacheKey, { userId, apiKeyId });

          // Log usage if it's an API key (don't await to avoid blocking)
          db.insert(apiKeyUsageLogs).values({
            id: crypto.randomUUID(),
            apiKeyId: keyRecord.id,
            endpoint: "/api/track",
            method: "POST",
            status: 200,
          }).catch((e) => console.error("Failed to log API key usage:", e));
        }
      }

      // 2. Fallback to Session
      if (!userId && session?.user?.id) {
        userId = session.user.id;
        cache.set(cacheKey, { userId, apiKeyId: null });
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Provide a valid API key or active session." },
        { status: 401, headers: cors },
      );
    }

    const payloadArray = Array.isArray(bodyJson) ? bodyJson : [bodyJson];
    const results = [];

    // Check rate limit 
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
            ...cors,
            "X-RateLimit-Limit": ratelimit.limit.toString(),
            "X-RateLimit-Remaining": ratelimit.remaining.toString(),
            "X-RateLimit-Reset": ratelimit.reset.toString(),
          },
        },
      );
    }

    const parser = new UAParser(req.headers.get("user-agent") || "");
    const deviceInfo = parser.getDevice()?.model || "Unknown Device";
    const osInfo = parser.getOS()?.name || "Unknown OS";
    const browserInfo = parser.getBrowser()?.name || "Unknown Browser";

    const geoInfo = {
      cityName: req.headers.get("x-vercel-ip-city") || "Unknown",
      regionName: req.headers.get("x-vercel-ip-country-region") || "Unknown",
      countryName: req.headers.get("x-vercel-ip-country") || "Unknown",
      countryCode: req.headers.get("x-vercel-ip-country-code") || "Unknown",
    };

    const visitorIp = ip.trim();
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

    // Process each event in the potentially batched payload
    for (const bodyItem of payloadArray) {
      const websiteId = bodyItem.websiteId;
      if (!websiteId) continue;

      // 3. Verify website ownership
      const siteCacheKey = `website:${websiteId}:${userId}`;
      let website = cache.get(siteCacheKey);

      if (!website) {
        website = await db.query.websites.findFirst({
          where: and(
            eq(websites.websiteId, websiteId),
            eq(websites.userId, userId)
          ),
        });
        if (website) {
          cache.set(siteCacheKey, website);
        }
      }

      if (!website) {
        // Skip invalid websites in batch 
        continue;
      }

      const validation = trackEventSchema.safeParse(bodyItem);
      if (!validation.success) {
        continue; // skip invalid items
      }

      const body = validation.data;
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
            entryTime: body.entryTime ? new Date(body.entryTime) : new Date(),
            exitTime: body.exitTime ? new Date(body.exitTime) : undefined,
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
        const updateData: Partial<typeof pageViews.$inferInsert> = {
          totalActiveTime: body.totalActiveTime,
        };

        if (body?.type === "exit") {
          updateData.exitTime = body.exitTime ? new Date(body.exitTime) : new Date();
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
      
      if (result) results.push(result[0]);
    }

    return NextResponse.json({
      message: "Data received successfully",
      count: results.length,
    }, { headers: cors });
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500, headers: CORS_HEADERS(req) },
    );
  }
}
