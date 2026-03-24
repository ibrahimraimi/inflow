import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@inflow/core/lib/auth";
import { websites } from "@inflow/db";
import { ReplayService } from "@inflow/core/server/services/replay.service";

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

    const { id: websiteId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const path = searchParams.get("path");

    // Verify website ownership
    const website = await db
      .select()
      .from(websites)
      .where(
        and(eq(websites.websiteId, websiteId), eq(websites.userId, session.user.id))
      );

    if (website.length === 0) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    let result;
    if (path) {
      result = await ReplayService.getSessionsForPath(websiteId, path);
    } else {
      // General list of sessions (not implemented in ReplayService yet, but I'll add it)
      // For now, let's reuse getSessionsForPath with empty path or just latest sessions
      result = await ReplayService.getSessionsForPath(websiteId, "/");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch Replays Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
