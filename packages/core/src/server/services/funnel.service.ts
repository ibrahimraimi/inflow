import { db, events, pageViews } from "@inflow/db";
import { and, eq, gte, lte, or, sql } from "drizzle-orm";
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

    // Build conditions for relevant activities
    const stepConditions = sortedSteps.map((step) => {
      const typeStr = step.type === "pageView" ? "pageView" : "event";
      return and(
        eq(sql.raw("activity_type"), typeStr),
        eq(sql.raw("activity_value"), step.value)
      );
    });

    const allActivitiesCTE = db.$with("all_activities").as(
      db
        .select({
          client_id: pageViews.clientId,
          activity_type: sql<string>`'pageView'`.as("activity_type"),
          activity_value: pageViews.url,
          activity_time: pageViews.entryTime,
        })
        .from(pageViews)
        .where(
          and(
            eq(pageViews.websiteId, websiteId),
            gte(pageViews.entryTime, startDate),
            lte(pageViews.entryTime, endDate)
          )
        )
        .unionAll(
          db
            .select({
              client_id: events.clientId,
              activity_type: sql<string>`'event'`.as("activity_type"),
              activity_value: events.eventName,
              activity_time: events.createdAt,
            })
            .from(events)
            .where(
              and(
                eq(events.websiteId, websiteId),
                gte(events.createdAt, startDate),
                lte(events.createdAt, endDate)
              )
            )
        )
    );

    const filteredActivitiesCTE = db.$with("filtered_activities").as(
      db
        .select()
        .from(allActivitiesCTE)
        .where(or(...stepConditions))
    );

    // Construct CTEs for each step
    const stepCTEs: any[] = [allActivitiesCTE, filteredActivitiesCTE];
    let lastStepCTE: any = null;
    const finalSelection: Record<string, any> = {};

    sortedSteps.forEach((step, index) => {
      const stepName = `step_${index + 1}`;
      const typeStr = step.type === "pageView" ? "pageView" : "event";
      
      const currentStepCTE = db.$with(stepName).as(
        index === 0
          ? db
              .select({
                client_id: filteredActivitiesCTE.client_id,
                time: sql`MIN(${filteredActivitiesCTE.activity_time})`.as("time"),
              })
              .from(filteredActivitiesCTE)
              .where(
                and(
                  eq(filteredActivitiesCTE.activity_type, typeStr),
                  eq(filteredActivitiesCTE.activity_value, step.value)
                )
              )
              .groupBy(filteredActivitiesCTE.client_id)
          : db
              .select({
                client_id: filteredActivitiesCTE.client_id,
                time: sql`MIN(${filteredActivitiesCTE.activity_time})`.as("time"),
              })
              .from(filteredActivitiesCTE)
              .innerJoin(
                lastStepCTE,
                eq(filteredActivitiesCTE.client_id, lastStepCTE.client_id)
              )
              .where(
                and(
                  eq(filteredActivitiesCTE.activity_type, typeStr),
                  eq(filteredActivitiesCTE.activity_value, step.value),
                  gte(filteredActivitiesCTE.activity_time, lastStepCTE.time)
                )
              )
              .groupBy(filteredActivitiesCTE.client_id)
      );

      stepCTEs.push(currentStepCTE);
      lastStepCTE = currentStepCTE;
      finalSelection[`${stepName}_count`] = sql`(SELECT COUNT(*) FROM ${currentStepCTE})`.mapWith(Number);
    });

    try {
      const result = await db
        .with(...stepCTEs)
        .select(finalSelection)
        .from(sql`(SELECT 1) as dummy`);

      const row = (result[0] || {}) as Record<string, number>;
      
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
