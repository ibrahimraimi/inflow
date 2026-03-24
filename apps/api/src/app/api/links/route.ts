import crypto from "crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@inflow/db";
import { and, eq } from "drizzle-orm";

import { auth } from "@inflow/core/lib/auth";
import { links } from "@inflow/db";
import { linkCreateSchema } from "@inflow/core/lib/validations/link";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const validation = linkCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 },
    );
  }

  const { linkId, name, shortCode, destinationUrl } = validation.data;

  const finalLinkId = linkId || crypto.randomUUID();

  // Check if shortCode already exists
  const existingLink = await db
    .select()
    .from(links)
    .where(
      and(eq(links.shortCode, shortCode), eq(links.userId, session.user.id))
    );

  if (existingLink.length > 0) {
    return NextResponse.json(
      { message: "Short code already exists!", data: existingLink }
      // { status: 400 }
    );
  }

  const result = await db
    .insert(links)
    .values({
      linkId: finalLinkId,
      name: name,
      shortCode: shortCode,
      destinationUrl: destinationUrl,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json(result, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await db
    .select()
    .from(links)
    .where(eq(links.userId, session.user.id));

  return NextResponse.json(result, { status: 200 });
}
