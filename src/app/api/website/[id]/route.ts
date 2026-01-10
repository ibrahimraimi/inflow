import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { pageViews, websites } from "@/db/schema";

export async function GET(
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

  const website = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
    );

  if (website.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  return NextResponse.json(website[0]);
}

export async function PUT(
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
  const { websiteName, domain, timeZone, enableLocalhostTracking } =
    await req.json();

  // Check if website exists and belongs to user
  const existingWebsite = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
    );

  if (existingWebsite.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  // Check if new domain already exists (if domain is being changed)
  if (domain && domain !== existingWebsite[0].domain) {
    const domainExists = await db
      .select()
      .from(websites)
      .where(
        and(eq(websites.domain, domain), eq(websites.userId, session.user.id))
      );

    if (domainExists.length > 0) {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 400 }
      );
    }
  }

  const result = await db
    .update(websites)
    .set({
      websiteName: websiteName || existingWebsite[0].websiteName,
      domain: domain || existingWebsite[0].domain,
      timeZone: timeZone || existingWebsite[0].timeZone,
      enableLocalhostTracking:
        enableLocalhostTracking !== undefined
          ? enableLocalhostTracking
          : existingWebsite[0].enableLocalhostTracking,
    })
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
    )
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(
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

  // Check if website exists and belongs to user
  const existingWebsite = await db
    .select()
    .from(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
    );

  if (existingWebsite.length === 0) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  // Delete website (pageViews will be cascade deleted)
  await db
    .delete(websites)
    .where(
      and(eq(websites.websiteId, id), eq(websites.userId, session.user.id))
    );

  return NextResponse.json({ message: "Website deleted successfully" });
}
