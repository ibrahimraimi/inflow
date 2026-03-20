"use server";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { getCurrentUser } from "./users";
import { member, organization } from "@/db/schema";
import { OrganizationService } from "./services/organization.service";

export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

  const members = await db.query.member.findMany({
    where: eq(member.userId, currentUser.id),
  });

  const organizations = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      members.map((m) => m.organizationId)
    ),
  });

  return organizations;
}

export async function getActiveOrganization(userId: string) {
  const { currentUser } = await getCurrentUser();

  if (userId !== currentUser.id) {
    return null;
  }

  return await OrganizationService.getActiveOrganization(userId);
}

export async function getOrganizationBySlug(slug: string) {
  try {
    const { currentUser } = await getCurrentUser();

    const organizationBySlug = await OrganizationService.getOrganizationBySlug(slug);

    if (!organizationBySlug) {
      return null;
    }

    // Verify membership
    const isMember = organizationBySlug.members.some(m => m.userId === currentUser.id);
    if (!isMember) {
      return null;
    }

    return organizationBySlug;
  } catch (error) {
    console.error(error);
    return null;
  }
}
