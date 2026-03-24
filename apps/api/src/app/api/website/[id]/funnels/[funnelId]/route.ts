import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";

import { auth } from "@inflow/core/lib/auth";
import { funnels, websites } from "@inflow/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; funnelId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, funnelId } = await params;

  const website = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id)),
    );

  if (website.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const funnel = await db
    .select()
    .from(funnels)
    .where(and(eq(funnels.id, Number(funnelId)), eq(funnels.websiteId, id)));

  if (funnel.length === 0) {
    return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
  }

  return NextResponse.json(funnel[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; funnelId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, funnelId } = await params;

  const website = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id)),
    );

  if (website.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const deleted = await db
    .delete(funnels)
    .where(and(eq(funnels.id, Number(funnelId)), eq(funnels.websiteId, id)))
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Funnel deleted successfully" });
}
