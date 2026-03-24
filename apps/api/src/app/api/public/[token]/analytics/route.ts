import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { websites } from "@inflow/db";
import { AnalyticsService } from "@inflow/core/server/services/analytics.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Find website with matching public token that is currently public
    const website = await db
      .select()
      .from(websites)
      .where(
        and(
          eq(websites.publicToken, token),
          eq(websites.isPublic, true)
        )
      );

    if (website.length === 0) {
      return NextResponse.json(
        { error: "Public dashboard not found or is not public anymore" },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "last_7_days";
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const analyticsData = await AnalyticsService.getData(
      website[0].websiteId,
      range,
      from,
      to
    );

    // Provide the website basics for the public view
    return NextResponse.json({
      ...analyticsData,
      website: {
        websiteName: website[0].websiteName,
        domain: website[0].domain,
      }
    });
  } catch (error: unknown) {
    console.error("Public Analytics API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
