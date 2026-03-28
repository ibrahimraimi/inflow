import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@inflow/logger";
import { websites, db } from "@inflow/db";
import { auth } from "@inflow/core/lib/auth";
import { AnalyticsService } from "@inflow/core/server/services/analytics.service";

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
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

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

    const analyticsData = await AnalyticsService.getData(id, range, from, to);

    return NextResponse.json(analyticsData);
  } catch (error: unknown) {
    logger.error({ err: error }, "Analytics API Error");
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
