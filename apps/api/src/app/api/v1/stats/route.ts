import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { apiKeys, websites, apiKeyUsageLogs } from "@inflow/db";
import { AnalyticsService } from "@inflow/core/server/services/analytics.service";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Format: Bearer <key>" },
      { status: 401 }
    );
  }

  const rawKey = authHeader.split(" ")[1];

  if (!rawKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }

  // 1. Hash the incoming key to verify against DB
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  try {
    // 2. Lookup the key
    const validKeyRecords = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        scope: apiKeys.scope,
      })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    const keyRecord = validKeyRecords[0];

    if (!keyRecord) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Helper to log usage
    const logUsage = async (status: number) => {
      Promise.all([
        db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, keyRecord.id))
          .execute(),
        db
          .insert(apiKeyUsageLogs)
          .values({
            id: crypto.randomUUID(),
            apiKeyId: keyRecord.id,
            endpoint: "/api/v1/stats",
            method: "GET",
            status,
          })
          .execute()
      ]).catch(console.error);
    };

    // 2. Validate scope
    if (keyRecord.scope !== "all" && keyRecord.scope !== "read_stats") {
      logUsage(403);
      return NextResponse.json(
        { error: "Forbidden: API key scope does not permit this action" },
        { status: 403 }
      );
    }

    // 3. Extract query parameters
    const { searchParams } = new URL(req.url);
    const targetWebsiteId = searchParams.get("websiteId");
    const range = searchParams.get("range") || "last_30_days";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!targetWebsiteId) {
      logUsage(400);
      return NextResponse.json(
        { error: "websiteId query parameter is required" },
        { status: 400 }
      );
    }

    // 4. Validate that the requesting user owns the website
    const siteRecords = await db
      .select({ id: websites.id })
      .from(websites)
      .where(
        and(
          eq(websites.websiteId, targetWebsiteId),
          eq(websites.userId, keyRecord.userId)
        )
      )
      .limit(1);

    if (siteRecords.length === 0) {
      logUsage(403);
      return NextResponse.json(
        { error: "Website not found or unauthorized access" },
        { status: 403 }
      );
    }

    // 5. Fetch and return analytics data
    const analyticsData = await AnalyticsService.getData(
      targetWebsiteId,
      range,
      from || undefined,
      to || undefined
    );

    logUsage(200);
    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("API error processing stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
