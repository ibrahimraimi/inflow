import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@inflow/core/lib/auth";
import { db } from "@inflow/db";
import { apiKeys } from "@inflow/db";
import { eq, and } from "drizzle-orm";

export async function DELETE(
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
    // Ensure the key belongs to the current user before deleting
    const result = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
      .returning({ deletedId: apiKeys.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "API key not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: result[0].deletedId });
  } catch (error) {
    console.error("Failed to delete API Key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
