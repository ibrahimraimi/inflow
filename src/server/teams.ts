"use server";

import { getCurrentUser } from "./users";
import { getActiveOrganization } from "./organizations";
import { TeamService } from "./services/team-service";

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

    const members = await TeamService.getMembers(activeOrg.id);

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

    const invitations = await TeamService.getPendingInvitations(activeOrg.id);

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

    const role = await TeamService.getMemberRole(activeOrg.id, currentUser.id);

    if (!role) {
      return { success: false, error: "Member not found" };
    }

    return { success: true, role };
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
    const memberToRemove = await TeamService.getMemberById(memberId);

    if (!memberToRemove) {
      return { success: false, error: "Member not found" };
    }

    // Check if trying to remove the last owner
    if (memberToRemove.role === "owner") {
      const ownersCount = await TeamService.countOwners(activeOrg.id);

      if (ownersCount <= 1) {
        return {
          success: false,
          error: "Cannot remove the last owner of the organization",
        };
      }
    }

    // Remove the member
    await TeamService.removeMember(memberId);

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
    const memberToUpdate = await TeamService.getMemberById(memberId);

    if (!memberToUpdate) {
      return { success: false, error: "Member not found" };
    }

    // Check if trying to change the last owner's role
    if (memberToUpdate.role === "owner" && newRole !== "owner") {
      const ownersCount = await TeamService.countOwners(activeOrg.id);

      if (ownersCount <= 1) {
        return {
          success: false,
          error: "Cannot change the role of the last owner",
        };
      }
    }

    // Update the role
    await TeamService.updateMemberRole(memberId, newRole);

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

    await TeamService.cancelInvitation(invitationId);

    return { success: true };
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}
