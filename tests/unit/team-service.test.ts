import { describe, it, expect, jest, beforeEach } from "bun:test";
import { TeamService } from "@/server/services/team-service";
import { db } from "@/db/drizzle";

jest.mock("@/db/drizzle", () => ({
  db: {
    query: {
      member: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      invitation: {
        findMany: jest.fn(),
      },
    },
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  },
}));

describe("TeamService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch members for an organization", async () => {
    const mockMembers = [{ id: "1", role: "owner" }];
    (db.query.member.findMany as jest.Mock).mockResolvedValue(mockMembers);

    const result = await TeamService.getMembers("org-1");
    expect(result).toEqual(mockMembers as any);
    expect(db.query.member.findMany).toHaveBeenCalled();
  });

  it("should fetch member role", async () => {
    (db.query.member.findFirst as jest.Mock).mockResolvedValue({ role: "admin" });

    const role = await TeamService.getMemberRole("org-1", "user-1");
    expect(role).toBe("admin");
  });

  it("should return null if member role not found", async () => {
    (db.query.member.findFirst as jest.Mock).mockResolvedValue(null);

    const role = await TeamService.getMemberRole("org-1", "user-1");
    expect(role).toBeNull();
  });
});
