import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@inflow/core/lib/auth";
import { websites } from "@inflow/db";
import { ReplayService } from "@inflow/core/server/services/replay.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: websiteId, sessionId } = await params;

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

    const result = await ReplayService.getSessionEvents(sessionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch Session Replay Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
