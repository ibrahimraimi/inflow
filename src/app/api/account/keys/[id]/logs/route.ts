import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { apiKeys, apiKeyUsageLogs } from "@/db/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
  }

  try {
    // 1. Ensure the key actually belongs to the user
    const keyRecord = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
      .limit(1);

    if (keyRecord.length === 0) {
      return NextResponse.json(
        { error: "API key not found or unauthorized" },
        { status: 404 }
      );
    }

    // 2. Fetch the logs for this specific key
    const logs = await db
      .select({
        id: apiKeyUsageLogs.id,
        endpoint: apiKeyUsageLogs.endpoint,
        method: apiKeyUsageLogs.method,
        status: apiKeyUsageLogs.status,
        createdAt: apiKeyUsageLogs.createdAt,
      })
      .from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.apiKeyId, id))
      .orderBy(desc(apiKeyUsageLogs.createdAt))
      .limit(100);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch API key logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
