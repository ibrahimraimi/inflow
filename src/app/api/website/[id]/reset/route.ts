import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { pageViews } from "@/db/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete all page views for this website
  await db.delete(pageViews).where(eq(pageViews.websiteId, id));

  return NextResponse.json({
    message: "Website statistics reset successfully",
  });
}
