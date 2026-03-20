"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { isAdmin } from "./permissions";
import { member, type Role } from "@/db/schema";

export const addMember = async (
  organizationId: string,
  userId: string,
  role: Role
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Check if current user is admin/owner of the organization
    const { success: hasPermission } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          organization: ["update"],
        },
      },
    });

    if (!hasPermission) {
      throw new Error("Forbidden: You don't have permission to add members.");
    }

    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add member.");
  }
};

export const removeMember = async (memberId: string) => {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: "You are not authorized to remove members.",
    };
  }

  try {
    await db.delete(member).where(eq(member.id, memberId));

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to remove member.",
    };
  }
};
