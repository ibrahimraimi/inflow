import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";

import { auth } from "@inflow/core/lib/auth";
import { funnels, websites } from "@inflow/db";
import { z } from "zod";

const funnelSchema = z.object({
  name: z.string().min(1),
  steps: z
    .array(
      z.object({
        type: z.enum(["pageView", "event"]),
        value: z.string().min(1),
        order: z.number().int(),
      }),
    )
    .min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // First check if the user has access to this website
  const website = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id)),
    );

  if (website.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const websiteFunnels = await db
    .select()
    .from(funnels)
    .where(eq(funnels.websiteId, id))
    .orderBy(funnels.createdAt);

  return NextResponse.json(websiteFunnels);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  const body = await req.json();
  const validation = funnelSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 },
    );
  }

  const result = await db
    .insert(funnels)
    .values({
      websiteId: id,
      name: validation.data.name,
      steps: validation.data.steps,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
