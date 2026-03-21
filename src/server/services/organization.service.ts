import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { member, organization } from "@/db/schema";

export class OrganizationService {
  static async getActiveOrganization(userId: string) {
    const memberUser = await db.query.member.findFirst({
      where: eq(member.userId, userId),
    });

    if (!memberUser) {
      return null;
    }

    const activeOrganization = await db.query.organization.findFirst({
      where: eq(organization.id, memberUser.organizationId),
    });

    return activeOrganization;
  }

  static async getOrganizationBySlug(slug: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
  }

  static async deleteOrganization(organizationId: string) {
    return await db.delete(organization).where(eq(organization.id, organizationId));
  }
}
