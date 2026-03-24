import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";

import { auth } from "@inflow/core/lib/auth";
import { funnels, websites } from "@inflow/db";
import { FunnelService } from "@inflow/core/server/services/funnel.service";
import type { FunnelStep } from "@inflow/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; funnelId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, funnelId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default last 30 days
    let endDate = new Date();

    if (from) startDate = new Date(from);
    if (to) endDate = new Date(to);

    // Verify access
    const website = await db
      .select()
      .from(websites)
      .where(
        and(eq(websites.websiteId, id), eq(websites.userId, session.user.id)),
      );

    if (website.length === 0) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const funnelRecords = await db
      .select()
      .from(funnels)
      .where(and(eq(funnels.id, Number(funnelId)), eq(funnels.websiteId, id)));

    if (funnelRecords.length === 0) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const funnel = funnelRecords[0];
    const steps = funnel.steps as FunnelStep[];

    const result = await FunnelService.evaluateFunnel(
      id,
      steps,
      startDate,
      endDate,
    );

    return NextResponse.json({
      funnel: {
        id: funnel.id,
        name: funnel.name,
      },
      evaluation: result,
    });
  } catch (error) {
    console.error("Funnel Evaluation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
