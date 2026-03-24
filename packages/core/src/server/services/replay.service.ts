import { db } from "@inflow/db";
import { sessionReplays } from "@inflow/db";
import { and, eq, desc } from "drizzle-orm";

export class ReplayService {
  /**
   * Save a batch of replay events
   */
  static async saveEvents(data: {
    websiteId: string;
    clientId: string;
    sessionId: string;
    events: any[];
  }) {
    try {
      // Check if session already exists for this client/website
      const existing = await db
        .select()
        .from(sessionReplays)
        .where(
          and(
            eq(sessionReplays.websiteId, data.websiteId),
            eq(sessionReplays.sessionId, data.sessionId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Append events to existing record
        const updatedEvents = [...(existing[0].events as any[]), ...data.events];
        await db
          .update(sessionReplays)
          .set({ events: updatedEvents })
          .where(eq(sessionReplays.id, existing[0].id));
        return { success: true, id: existing[0].id };
      } else {
        // Create new record
        const result = await db
          .insert(sessionReplays)
          .values({
            websiteId: data.websiteId,
            clientId: data.clientId,
            sessionId: data.sessionId,
            events: data.events,
          })
          .returning();
        return { success: true, id: result[0].id };
      }
    } catch (error) {
      console.error("Error saving replay events:", error);
      return { success: false, error: "Failed to save replay events" };
    }
  }

  /**
   * Fetch events for a specific session
   */
  static async getSessionEvents(sessionId: string) {
    try {
      const result = await db
        .select()
        .from(sessionReplays)
        .where(eq(sessionReplays.sessionId, sessionId))
        .limit(1);

      if (result.length === 0) {
        return { success: false, error: "Session not found" };
      }

      return { success: true, events: result[0].events };
    } catch (error) {
      console.error("Error fetching session events:", error);
      return { success: false, error: "Failed to fetch session events" };
    }
  }

  /**
   * Find sessions that visited a specific path
   */
  static async getSessionsForPath(websiteId: string, path: string) {
    try {
      // This is a bit expensive since events is JSONB. 
      // For MVP, we'll fetch replays and filter in JS or use a simple JSONB contains/path query.
      // Better: In analytics.js we already record 'nav' events.
      
      const result = await db
        .select({
          sessionId: sessionReplays.sessionId,
          clientId: sessionReplays.clientId,
          createdAt: sessionReplays.createdAt,
          events: sessionReplays.events
        })
        .from(sessionReplays)
        .where(eq(sessionReplays.websiteId, websiteId))
        .orderBy(desc(sessionReplays.createdAt))
        .limit(50);

      // Filter sessions that have at least one event with the matching path
      const filtered = result.filter(session => {
        const events = session.events as any[];
        return events.some(e => e.url === path);
      });

      return { success: true, sessions: filtered.map(s => ({
        sessionId: s.sessionId,
        clientId: s.clientId,
        createdAt: s.createdAt,
        eventCount: (s.events as any[]).length
      })) };
    } catch (error) {
      console.error("Error finding sessions for path:", error);
      return { success: false, error: "Failed to find sessions" };
    }
  }
}
