import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { links } from "@/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { linkId, name, shortCode, destinationUrl } = await req.json();

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
      linkId: linkId,
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
