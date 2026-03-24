import { db } from "@inflow/db";
import { sql } from "drizzle-orm";
import type { FunnelStep } from "@inflow/types";

export class FunnelService {
  static async evaluateFunnel(
    websiteId: string,
    steps: FunnelStep[],
    startDate: Date,
    endDate: Date
  ) {
    if (steps.length === 0) {
      return [];
    }

    // Sort steps by order to ensure chronological evaluation
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

    // Build the query to unify page views and events into a single timeline per user
    const stepConditions = sortedSteps.map((step) => {
      const typeMatch = step.type === "pageView" ? "pageView" : "event";
      return sql`(activity_type = ${typeMatch} AND activity_value = ${step.value})`;
    });

    const allActivitiesCTE = sql`
      all_activities AS (
        SELECT
          client_id,
          'pageView' as activity_type,
          url as activity_value,
          (CASE 
              WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
              WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
              ELSE NULL
          END) as activity_time
        FROM page_views
        WHERE website_id = ${websiteId}
        AND (CASE 
              WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
              WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
              ELSE NULL
          END) >= ${startDate.toISOString()}::timestamp
        AND (CASE 
              WHEN "entry_time" ~ '^[0-9]+$' THEN to_timestamp("entry_time"::bigint)
              WHEN "entry_time" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN "entry_time"::timestamp
              ELSE NULL
          END) <= ${endDate.toISOString()}::timestamp

        UNION ALL

        SELECT
          client_id,
          'event' as activity_type,
          event_name as activity_value,
          created_at as activity_time
        FROM events
        WHERE website_id = ${websiteId}
        AND created_at >= ${startDate.toISOString()}::timestamp
        AND created_at <= ${endDate.toISOString()}::timestamp
      ),
      filtered_activities AS (
        SELECT * FROM all_activities WHERE ${sql.join(stepConditions, sql` OR `)}
      )
    `;

    // Construct CTEs for each step
    const stepCTEs: any[] = [];
    const selectCounts: any[] = [];

    sortedSteps.forEach((step, index) => {
      const stepName = sql.raw(`step_${index + 1}`);
      const typeStr = step.type === "pageView" ? "pageView" : "event";
      
      if (index === 0) {
        stepCTEs.push(sql`
          ${stepName} AS (
            SELECT client_id, MIN(activity_time) as time
            FROM filtered_activities
            WHERE activity_type = ${typeStr} AND activity_value = ${step.value}
            GROUP BY client_id
          )
        `);
      } else {
        const prevStepName = sql.raw(`step_${index}`);
        stepCTEs.push(sql`
          ${stepName} AS (
            SELECT a.client_id, MIN(a.activity_time) as time
            FROM filtered_activities a
            JOIN ${prevStepName} prev ON a.client_id = prev.client_id
            WHERE a.activity_type = ${typeStr} 
              AND a.activity_value = ${step.value}
              AND a.activity_time >= prev.time
            GROUP BY a.client_id
          )
        `);
      }
      
      selectCounts.push(sql`(SELECT COUNT(*) FROM ${stepName}) as ${sql.raw(`step_${index + 1}_count`)}`);
    });

    const finalQuery = sql`
      WITH ${allActivitiesCTE},
      ${sql.join(stepCTEs, sql`,\n`)}
      SELECT ${sql.join(selectCounts, sql`, `)}
    `;

    try {
      const result = await db.execute(finalQuery);
      // @ts-ignore
      const row = (result.rows?.[0] || result[0] || {}) as Record<string, unknown>;
      
      return sortedSteps.map((step, index) => {
        const stepName = `step_${index + 1}`;
        return {
          step: Math.floor(step.order),
          type: step.type,
          value: step.value,
          count: Number(row[`${stepName}_count`] || 0),
        };
      });
    } catch (e) {
      console.error("Funnel Evaluation Error", e);
      return [];
    }
  }
}
