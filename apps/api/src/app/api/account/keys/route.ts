import crypto from "crypto";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@inflow/core/lib/auth";
import { db } from "@inflow/db";
import { apiKeys } from "@inflow/db";
import { apiKeyCreateSchema } from "@inflow/core/lib/validations/api-key";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      hint: apiKeys.hint,
      name: apiKeys.name,
      scope: apiKeys.scope,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const validation = apiKeyCreateSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { name, scope } = validation.data;

    // 1. Generate the raw key ("inflow_xxxxxxxxxxxxxxxxxx")
    const rawSecret = crypto.randomBytes(32).toString("hex");
    const rawKey = `inflow_${rawSecret}`;

    // 2. Extract hint for UI
    const hint = rawKey.substring(0, 11) + "..." + rawKey.substring(rawKey.length - 4);

    // 3. Hash the key for secure storage
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // 4. Generate unique ID for the key record
    const keyId = crypto.randomUUID();

    // 5. Store in DB
    await db.insert(apiKeys).values({
      id: keyId,
      keyHash: keyHash,
      hint: hint,
      name: name,
      scope: scope,
      userId: session.user.id,
    });

    // 6. Return the raw key ONCE and never again
    return NextResponse.json(
      {
        id: keyId,
        hint: hint,
        name: name,
        scope: scope,
        key: rawKey,
        createdAt: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to generate API Key:", error);
    return NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 }
    );
  }
}
