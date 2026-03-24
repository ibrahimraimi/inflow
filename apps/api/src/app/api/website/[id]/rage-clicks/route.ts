import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@inflow/core/lib/auth";
import { websites } from "@inflow/db";
import { EventsService } from "@inflow/core/server/services/events.service";

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

    const rageClicks = await EventsService.getRageClicks(id, range, from, to);

    return NextResponse.json(rageClicks);
  } catch (error: unknown) {
    console.error("Rage Clicks API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
