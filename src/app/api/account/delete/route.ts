import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password confirmation is required" },
        { status: 400 },
      );
    }

    // Verify password before deletion
    // We need to verify the user's password by attempting a sign in
    const verification = await auth.api.signInEmail({
      body: {
        email: session.user.email,
        password,
      },
      headers: await headers(),
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Delete the user account (CASCADE constraints will handle related data)
    await db.delete(user).where(eq(user.id, session.user.id));

    // Sign out the user
    await auth.api.signOut({
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting account" },
      { status: 500 },
    );
  }
}
