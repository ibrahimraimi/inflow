import { eq, and, count } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, organization, invitation, user } from "@/db/schema";

export class TeamService {
  static async getMembers(organizationId: string) {
    return await db.query.member.findMany({
      where: eq(member.organizationId, organizationId),
      with: {
        user: true,
      },
    });
  }

  static async getPendingInvitations(organizationId: string) {
    return await db.query.invitation.findMany({
      where: and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending"),
      ),
    });
  }

  static async getMemberRole(organizationId: string, userId: string) {
    const record = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, userId),
      ),
    });
    return record?.role || null;
  }

  static async removeMember(memberId: string) {
    return await db.delete(member).where(eq(member.id, memberId));
  }

  static async updateMemberRole(memberId: string, newRole: "owner" | "admin" | "member") {
    return await db
      .update(member)
      .set({ role: newRole })
      .where(eq(member.id, memberId));
  }

  static async countOwners(organizationId: string) {
    const result = await db
      .select({ value: count() })
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.role, "owner"),
        )
      );
    return result[0].value;
  }

  static async cancelInvitation(invitationId: string) {
    return await db.delete(invitation).where(eq(invitation.id, invitationId));
  }

  static async getMemberById(memberId: string) {
    return await db.query.member.findFirst({
      where: eq(member.id, memberId),
    });
  }
}
