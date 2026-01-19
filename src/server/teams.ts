"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, organization, invitation, user } from "@/db/schema";
import { getCurrentUser } from "./users";
import { getActiveOrganization } from "./organizations";

/**
 * Get all members of the current user's organization
 */
export async function getTeamMembers() {
  try {
    const { currentUser } = await getCurrentUser();
    const activeOrg = await getActiveOrganization(currentUser.id);

    if (!activeOrg) {
      return { success: false, error: "No active organization found" };
    }

    const members = await db.query.member.findMany({
      where: eq(member.organizationId, activeOrg.id),
      with: {
        user: true,
      },
    });

    return { success: true, members };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { success: false, error: "Failed to fetch team members" };
  }
}

/**
 * Get pending invitations for the current organization
 */
export async function getPendingInvitations() {
  try {
    const { currentUser } = await getCurrentUser();
    const activeOrg = await getActiveOrganization(currentUser.id);

    if (!activeOrg) {
      return { success: false, error: "No active organization found" };
    }

    const invitations = await db.query.invitation.findMany({
      where: and(
        eq(invitation.organizationId, activeOrg.id),
        eq(invitation.status, "pending"),
      ),
    });

    return { success: true, invitations };
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return { success: false, error: "Failed to fetch invitations" };
  }
}

/**
 * Get the current user's role in their active organization
 */
export async function getCurrentMemberRole() {
  try {
    const { currentUser } = await getCurrentUser();
    const activeOrg = await getActiveOrganization(currentUser.id);

    if (!activeOrg) {
      return { success: false, error: "No active organization found" };
    }

    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, activeOrg.id),
        eq(member.userId, currentUser.id),
      ),
    });

    if (!memberRecord) {
      return { success: false, error: "Member not found" };
    }

    return { success: true, role: memberRecord.role };
  } catch (error) {
    console.error("Error fetching member role:", error);
    return { success: false, error: "Failed to fetch member role" };
  }
}

/**
 * Check if user has permission to perform admin actions
 */
async function checkAdminPermission() {
  const roleResult = await getCurrentMemberRole();

  if (!roleResult.success || !roleResult.role) {
    return false;
  }

  return roleResult.role === "owner" || roleResult.role === "admin";
}

/**
 * Check if user is an owner
 */
async function checkOwnerPermission() {
  const roleResult = await getCurrentMemberRole();

  if (!roleResult.success || !roleResult.role) {
    return false;
  }

  return roleResult.role === "owner";
}

/**
 * Remove a member from the team
 */
export async function removeMember(memberId: string) {
  try {
    const hasPermission = await checkAdminPermission();
    if (!hasPermission) {
      return { success: false, error: "Insufficient permissions" };
    }

    const { currentUser } = await getCurrentUser();
    const activeOrg = await getActiveOrganization(currentUser.id);

    if (!activeOrg) {
      return { success: false, error: "No active organization found" };
    }

    // Get the member to remove
    const memberToRemove = await db.query.member.findFirst({
      where: eq(member.id, memberId),
    });

    if (!memberToRemove) {
      return { success: false, error: "Member not found" };
    }

    // Check if trying to remove the last owner
    if (memberToRemove.role === "owner") {
      const owners = await db.query.member.findMany({
        where: and(
          eq(member.organizationId, activeOrg.id),
          eq(member.role, "owner"),
        ),
      });

      if (owners.length <= 1) {
        return {
          success: false,
          error: "Cannot remove the last owner of the organization",
        };
      }
    }

    // Remove the member
    await db.delete(member).where(eq(member.id, memberId));

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return { success: false, error: "Failed to remove member" };
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  memberId: string,
  newRole: "owner" | "admin" | "member",
) {
  try {
    const isOwner = await checkOwnerPermission();
    if (!isOwner) {
      return { success: false, error: "Only owners can change roles" };
    }

    const { currentUser } = await getCurrentUser();
    const activeOrg = await getActiveOrganization(currentUser.id);

    if (!activeOrg) {
      return { success: false, error: "No active organization found" };
    }

    // Get the member to update
    const memberToUpdate = await db.query.member.findFirst({
      where: eq(member.id, memberId),
    });

    if (!memberToUpdate) {
      return { success: false, error: "Member not found" };
    }

    // Check if trying to change the last owner's role
    if (memberToUpdate.role === "owner" && newRole !== "owner") {
      const owners = await db.query.member.findMany({
        where: and(
          eq(member.organizationId, activeOrg.id),
          eq(member.role, "owner"),
        ),
      });

      if (owners.length <= 1) {
        return {
          success: false,
          error: "Cannot change the role of the last owner",
        };
      }
    }

    // Update the role
    await db
      .update(member)
      .set({ role: newRole })
      .where(eq(member.id, memberId));

    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, error: "Failed to update member role" };
  }
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const hasPermission = await checkAdminPermission();
    if (!hasPermission) {
      return { success: false, error: "Insufficient permissions" };
    }

    await db.delete(invitation).where(eq(invitation.id, invitationId));

    return { success: true };
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}
