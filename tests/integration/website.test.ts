/**
 * @jest-environment node
 */
import { POST } from "@/app/api/website/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";

jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn(),
  }),
}));

jest.mock("@/db/drizzle", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 1 }]),
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

const mockGetSession = auth.api.getSession as jest.Mock;

describe("POST /api/website", () => {
  it("should return 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/website", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if validation fails", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "123" },
    });
    const req = new NextRequest("http://localhost/api/website", {
      method: "POST",
      body: JSON.stringify({ websiteName: "" }), // Invalid body
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 201 on successful creation", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "123" },
    });
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]), // No existing domain
    });

    const req = new NextRequest("http://localhost/api/website", {
      method: "POST",
      body: JSON.stringify({
        websiteId: "550e8400-e29b-41d4-a716-446655440000",
        websiteName: "Test Site",
        domain: "example.com",
        timeZone: "UTC",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
