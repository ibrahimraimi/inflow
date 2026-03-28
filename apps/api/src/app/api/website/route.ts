import crypto from "crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { toZonedTime } from "date-fns-tz";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { logger } from "@inflow/logger";
import { auth } from "@inflow/core/lib/auth";
import { websites, pageViews, db } from "@inflow/db";
import { AnalyticsService } from "@inflow/core/server/services/analytics.service";
import {
  getSafeTimeZone,
  formatDateInTz,
  getDomainName,
  formatCountries,
  formatCities,
  formatRegions,
  formatReferrals,
  formatWithImage,
} from "@inflow/core/lib/helpers";
import type { WebsiteWithAnalytics } from "@inflow/types";
import {
  websiteCreateSchema,
  websiteQuerySchema,
} from "@inflow/core/lib/validations/website";

/**
 * @swagger
 * /api/website:
 *   get:
 *     summary: List user websites with analytics
 *     description: Returns a list of websites owned by the authenticated user, including aggregated analytics for each.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: websiteId
 *         schema:
 *           type: string
 *         description: Specific website ID to fetch
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: websiteOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, only returns website settings without analytics
 *     responses:
 *       200:
 *         description: List of websites
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new website
 *     description: Registers a new website for tracking.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [websiteName, domain]
 *             properties:
 *               websiteName:
 *                 type: string
 *               domain:
 *                 type: string
 *               timeZone:
 *                 type: string
 *               enableLocalhostTracking:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Website created
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const validation = websiteCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 },
    );
  }

  const { websiteId, websiteName, domain, timeZone, enableLocalhostTracking } =
    validation.data;

  // Check if domain already exists
  const existingDomain = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.domain, domain), eq(websites.userId, session.user.id)),
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
  const params = Object.fromEntries(searchParams.entries());
  const validation = websiteQuerySchema.safeParse(params);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: validation.error.format() },
      { status: 400 },
    );
  }

  const { websiteId, from, to, websiteOnly } = validation.data;

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
            eq(websites.websiteId, websiteId),
          ),
        );
      return NextResponse.json(specificSite[0]);
    }

    const allSites = await query.orderBy(desc(websites.id));
    return NextResponse.json(allSites);
  }

  /* FETCH WEBSITES WITH ANALYTICS */
  try {
    if (websiteId) {
      const data = await AnalyticsService.getData(
        websiteId,
        from || "last_7_days",
        from,
        to,
        session.user.id,
      );
      
      const site = await db.query.websites.findFirst({
        where: and(
          eq(websites.userId, session.user.id),
          eq(websites.websiteId, websiteId),
        ),
      });

      if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });

      // Return in the format expected by the frontend
      return NextResponse.json({
        website: site,
        analytics: data, // Note: In detail page, this matches AnalyticsData
      });
    }

    // List view summary
    const summary = await AnalyticsService.getUserWebsitesSummary(session.user.id);
    return NextResponse.json(summary);
  } catch (error) {
    logger.error({ err: error }, "Dashboard Analytics Error");
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
