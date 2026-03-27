import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db, events, pageViews } from "@inflow/db";
import type { FlowData, FlowNode, FlowLink } from "@inflow/types";

export class FlowService {
  static async getFlowData(
    websiteId: string,
    range: string,
    from?: string,
    to?: string
  ): Promise<FlowData> {
    // 1. Calculate Date Range (Reusable logic from AnalyticsService)
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
      case "last_7_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "last_30_days":
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "custom":
        if (from) startDate = new Date(from);
        if (to) endDate = new Date(to);
        break;
      default:
        startDate = startOfDay(new Date());
        startDate.setDate(startDate.getDate() - 7);
    }

    // 2. Execute the Flow Reconstruction Query
    const combinedEvents = db.$with("CombinedEvents").as(
      db
        .select({
          client_id: pageViews.clientId,
          url_name: pageViews.url,
          type: sql<string>`'page'`.as("type"),
          timestamp: pageViews.entryTime,
        })
        .from(pageViews)
        .where(eq(pageViews.websiteId, websiteId))
        .unionAll(
          db
            .select({
              client_id: events.clientId,
              url_name: events.eventName,
              type: sql<string>`'event'`.as("type"),
              timestamp: events.createdAt,
            })
            .from(events)
            .where(eq(events.websiteId, websiteId))
        )
    );

    const orderedEvents = db.$with("OrderedEvents").as(
      db
        .select({
          client_id: combinedEvents.client_id,
          url_name: combinedEvents.url_name,
          type: combinedEvents.type,
          timestamp: combinedEvents.timestamp,
          step_number: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${combinedEvents.client_id} ORDER BY ${combinedEvents.timestamp})`.as("step_number"),
        })
        .from(combinedEvents)
        .where(
          and(
            gte(combinedEvents.timestamp, startDate),
            lte(combinedEvents.timestamp, endDate)
          )
        )
    );

    const transitions = db.$with("Transitions").as(
      db
        .select({
          source_name: orderedEvents.url_name,
          source_type: orderedEvents.type,
          target_name: sql<string>`LEAD(${orderedEvents.url_name}) OVER (PARTITION BY ${orderedEvents.client_id} ORDER BY ${orderedEvents.step_number})`.as("target_name"),
          target_type: sql<string>`LEAD(${orderedEvents.type}) OVER (PARTITION BY ${orderedEvents.client_id} ORDER BY ${orderedEvents.step_number})`.as("target_type"),
          step_number: orderedEvents.step_number,
        })
        .from(orderedEvents)
        .where(sql`${orderedEvents.step_number} < 5`)
    );

    const rows = await db
      .with(combinedEvents, orderedEvents, transitions)
      .select({
        source_name: transitions.source_name,
        source_type: sql<"page" | "event">`${transitions.source_type}`,
        target_name: transitions.target_name,
        target_type: sql<"page" | "event">`${transitions.target_type}`,
        step_number: transitions.step_number,
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(transitions)
      .where(sql`${transitions.target_name} IS NOT NULL`)
      .groupBy(
        transitions.source_name,
        transitions.source_type,
        transitions.target_name,
        transitions.target_type,
        transitions.step_number
      )
      .orderBy(transitions.step_number, sql`count DESC`);

    // 3. Clean and Transform in JS
    const cleanPath = (url: string) => {
      if (!url) return "/";
      try {
        // Handle cases where URL might be relative or full
        let path = url;
        if (url.includes("://")) {
          const uri = new URL(url);
          path = uri.pathname;
        } else if (url.startsWith("/")) {
          path = url.split("?")[0].split("#")[0];
        }
        
        // Remove trailing slash except for root
        if (path.length > 1 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }
        
        return path || "/";
      } catch {
        // Fallback for malformed URLs: try to strip everything before the first slash after the domain
        const match = url.match(/^https?:\/\/[^\/]+(\/.*)/i);
        return match ? match[1].split("?")[0] : url;
      }
    };

    // First pass: clean paths and aggregate
    const initialAgg = new Map<string, number>();
    for (const row of rows) {
      const sName = cleanPath(row.source_name || "");
      const tName = cleanPath(row.target_name || "");
      const key = `${sName}|${row.source_type}|${tName}|${row.target_type}|${row.step_number}`;
      initialAgg.set(key, (initialAgg.get(key) || 0) + row.count);
    }

    // Second pass: Limit to Top 8 transitions per step to keep it clean
    const stepCounts = new Map<number, Array<{ key: string, count: number }>>();
    for (const [key, count] of Array.from(initialAgg.entries())) {
      const step = parseInt(key.split('|')[4]);
      const list = stepCounts.get(step) || [];
      list.push({ key, count });
      stepCounts.set(step, list);
    }

    const finalLinks: FlowLink[] = [];
    const finalNodesMap = new Map<string, FlowNode>();
    const nodeMapping = new Map<string, string>(); // name_step -> id

    const getNodeId = (name: string, step: number, type: "page" | "event") => {
      const key = `${name}_${step}`;
      if (!nodeMapping.has(key)) {
        const id = `node_${finalNodesMap.size}`;
        nodeMapping.set(key, id);
        finalNodesMap.set(id, { id, name, step, type });
        return id;
      }
      return nodeMapping.get(key)!;
    };

    for (const [step, list] of Array.from(stepCounts.entries())) {
      const sorted = list.sort((a, b) => b.count - a.count);
      const top = sorted.slice(0, 8);
      const others = sorted.slice(8);

      for (const item of top) {
        const [sName, sType, tName, tType, _] = item.key.split('|');
        const sId = getNodeId(sName, step, sType as "page" | "event");
        const tId = getNodeId(tName, step + 1, tType as "page" | "event");
        finalLinks.push({ source: sId, target: tId, value: item.count, type: sType as "page" | "event" });
      }

      if (others.length > 0) {
        const otherCount = others.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0);
        // We link "Other" from the sources of the excluded transitions to an "Other" target
        // But for simplicity, we'll just group them into one "Other" transition if they share same step
        const sId = getNodeId("Other", step, "event");
        const tId = getNodeId("Other", step + 1, "event");
        finalLinks.push({ source: sId, target: tId, value: otherCount, type: "event" });
      }
    }

    return { 
      nodes: Array.from(finalNodesMap.values()), 
      links: finalLinks 
    };
  }
}
