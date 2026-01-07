import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { websites } from "@/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { websiteId, domain, timeZone, enableLocalhostTracking } =
    await req.json();

  // Check if domain already exists
  const existingDomain = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.domain, domain), eq(websites.userId, session.user.id))
    );

  if (existingDomain.length > 0) {
    return NextResponse.json(
      { message: "Domain already exists!", data: existingDomain }
      // { status: 400 }
    );
  }

  const result = await db
    .insert(websites)
    .values({
      websiteId: websiteId,
      domain: domain,
      timeZone: timeZone,
      enableLocalhostTracking: enableLocalhostTracking,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json(result, { status: 201 });
}
