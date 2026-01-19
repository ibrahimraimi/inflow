import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required" },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Use better-auth's changeEmail method
    const result = await auth.api.changeEmail({
      body: {
        newEmail,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to change email" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Email change initiated. Please check your new email for verification.",
    });
  } catch (error: any) {
    console.error("Email change error:", error);

    // Handle specific error cases
    if (error?.message?.includes("already exists")) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An error occurred while changing email" },
      { status: 500 },
    );
  }
}
