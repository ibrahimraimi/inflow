import { db } from "@inflow/db";
import { sql } from "drizzle-orm";
import { pageViews, events } from "@inflow/db";
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
    const query = sql`
      WITH CombinedEvents AS (
        SELECT 
          client_id,
          url AS url_name,
          'page' as type,
          entry_time AS timestamp
        FROM ${pageViews}
        WHERE website_id = ${websiteId}
        UNION ALL
        SELECT 
          client_id,
          event_name AS url_name,
          'event' as type,
          created_at AS timestamp
        FROM ${events}
        WHERE website_id = ${websiteId}
      ),
      OrderedEvents AS (
        SELECT 
          client_id,
          url_name,
          type,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY timestamp) as step_number
        FROM CombinedEvents
        WHERE timestamp >= ${startDate.toISOString()}::timestamp 
          AND timestamp <= ${endDate.toISOString()}::timestamp
      ),
      Transitions AS (
        SELECT 
          url_name as source_name,
          type as source_type,
          LEAD(url_name) OVER (PARTITION BY client_id ORDER BY step_number) as target_name,
          LEAD(type) OVER (PARTITION BY client_id ORDER BY step_number) as target_type,
          step_number
        FROM OrderedEvents
        WHERE step_number < 5
      )
      SELECT 
        source_name, 
        source_type,
        target_name, 
        target_type,
        step_number, 
        COUNT(*)::int as count
      FROM Transitions
      WHERE target_name IS NOT NULL
      GROUP BY source_name, source_type, target_name, target_type, step_number
      ORDER BY step_number, count DESC;
    `;

    const result = await db.execute(query);
    const rows = result.rows as unknown as Array<{
      source_name: string;
      source_type: "page" | "event";
      target_name: string;
      target_type: "page" | "event";
      step_number: number;
      count: number;
    }>;

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
      const sName = cleanPath(row.source_name);
      const tName = cleanPath(row.target_name);
      const key = `${sName}|${row.source_type}|${tName}|${row.target_type}|${row.step_number}`;
      initialAgg.set(key, (initialAgg.get(key) || 0) + row.count);
    }

    // Second pass: Limit to Top 8 transitions per step to keep it clean
    const stepCounts = new Map<number, Array<{ key: string, count: number }>>();
    for (const [key, count] of initialAgg.entries()) {
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

    for (const [step, list] of stepCounts.entries()) {
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
        const otherCount = others.reduce((acc, curr) => acc + curr.count, 0);
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
