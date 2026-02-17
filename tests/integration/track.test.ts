/**
 * @jest-environment node
 */
import { POST } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { rateLimit } from "@/lib/rate-limit";

jest.mock("@/db/drizzle", () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 1 }]),
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
}));

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    cityName: "Test City",
    regionName: "Test Region",
    countryName: "Test Country",
    countryCode: "TC",
  }),
});

describe("POST /api/track", () => {
  it("should return 200 and save data on valid entry request", async () => {
    const body = {
      clientId: "client-1",
      websiteId: "550e8400-e29b-41d4-a716-446655440000",
      domain: "example.com",
      url: "https://example.com/",
      type: "entry",
    };

    const req = new NextRequest("http://localhost/api/track", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Data received successfully");
    expect(db.insert).toHaveBeenCalled();
  });

  it("should return 429 if rate limited", async () => {
    (rateLimit as jest.Mock).mockResolvedValueOnce({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest("http://localhost/api/track", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
