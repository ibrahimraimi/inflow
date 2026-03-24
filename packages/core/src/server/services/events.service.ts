import { db } from "@inflow/db";
import { and, eq, gte, lte, sql, count, desc } from "drizzle-orm";
import { events } from "@inflow/db";

export class EventsService {
  static async getRageClicks(websiteId: string, range: string, from?: string, to?: string) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    const startOfDay = (d: Date) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };

    switch (range) {
      case "today":
        startDate = startOfDay(new Date());
        break;
      case "last_24_hours":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "this_week":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case "last_7_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "this_month":
        startDate = startOfDay(new Date());
        startDate.setDate(1);
        break;
      case "last_30_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "last_90_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "this_year":
        startDate = startOfDay(new Date());
        startDate.setMonth(0, 1);
        break;
      case "last_12_months":
        startDate = startOfDay(new Date());
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case "all_time":
        startDate = new Date(0); 
        break;
      case "custom":
        if (from) startDate = new Date(from);
        if (to) endDate = new Date(to);
        break;
      default:
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
    }

    const whereClause = and(
      eq(events.websiteId, websiteId),
      eq(events.eventName, "rage_click"),
      gte(events.createdAt, startDate),
      lte(events.createdAt, endDate)
    );

    // Group by element, text, and url
    const result = await db
      .select({
        element: sql<string>`${events.properties}->>'element'`,
        text: sql<string>`${events.properties}->>'text'`,
        url: sql<string>`${events.properties}->>'url'`,
        clicks: count(),
        uniqueUsers: sql<number>`count(distinct ${events.clientId})`
      })
      .from(events)
      .where(whereClause)
      .groupBy(
        sql`${events.properties}->>'element'`,
        sql`${events.properties}->>'text'`,
        sql`${events.properties}->>'url'`
      )
      .orderBy(desc(count()))
      .limit(50);

    return result;
  }
}
