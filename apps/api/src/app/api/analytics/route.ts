import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@inflow/core/lib/auth";
import { AnalyticsService } from "@inflow/core/server/services/analytics.service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const params = Object.fromEntries(searchParams.entries());
  
  const { z } = await import("zod");
  const validation = z.object({
    range: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }).safeParse(params);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: validation.error.format() },
      { status: 400 },
    );
  }

  const { range, from, to } = validation.data;

  try {
    const data = await AnalyticsService.getData(
      "all",
      range || "last_7_days",
      from,
      to,
      session.user.id
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Multi-Site Analytics Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch aggregated analytics" },
      { status: 500 },
    );
  }
}
