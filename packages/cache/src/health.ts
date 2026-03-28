import { redis } from "./redis";
import { logger } from "@inflow/logger";

export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) {
    logger.warn("Redis is not configured");
    return false;
  }
  
  try {
    const res = await redis.ping();
    return res === "PONG";
  } catch (error) {
    logger.error({ err: error }, "Redis health check failed");
    return false;
  }
}
