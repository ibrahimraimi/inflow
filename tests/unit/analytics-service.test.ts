import { describe, it, expect, jest, beforeEach } from "bun:test";
import { AnalyticsService } from "@/server/services/analytics.service";
import { db } from "@/db/drizzle";

jest.mock("@/db/drizzle", () => {
  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ rows: [] }),
    // To handle the final execution in select chains
    then: (resolve: any) => resolve([]),
  };
  // Handle select() specifically to return chains that eventually resolve
  mockDb.select.mockImplementation(() => {
    const chain: any = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: (resolve: any) => resolve([{ count: 10, avg: 5 }]),
    };
    // Make methods return the chain
    Object.keys(chain).forEach(key => {
        if (typeof chain[key] === 'function' && key !== 'then') {
            chain[key].mockReturnValue(chain);
        }
    });
    return chain;
  });
  return { db: mockDb };
});

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return formatted analytics data structure", async () => {
    // Mock Promise.all results
    const result = await AnalyticsService.getData("site-1", "last_7_days");

    expect(result).toHaveProperty("metrics");
    expect(result).toHaveProperty("chart");
    expect(result).toHaveProperty("tables");
    expect(result).toHaveProperty("map");
    expect(result).toHaveProperty("traffic");
  });

  it("should handle today range correctly", async () => {
    const result = await AnalyticsService.getData("site-1", "today");
    expect(db.execute).toHaveBeenCalled();
  });
});
