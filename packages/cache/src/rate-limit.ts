import { redis } from "./redis";
import { logger } from "@inflow/logger";

type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const stores = new Map<string, RateLimitStore>();

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  storeName = "default",
  failClosedOnRedisFailure = false
) {
  // Use Redis if available
  if (redis) {
    try {
      const key = `ratelimit:${storeName}:${identifier}`;
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }

      const ttl = await redis.pttl(key);
      const now = Date.now();

      return {
        success: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        reset: now + (ttl > 0 ? ttl : windowMs),
      };
    } catch (error) {
      logger.warn({ err: error }, "Redis rate limit failed, falling back to memory store");
      if (failClosedOnRedisFailure) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: Date.now() + windowMs,
        };
      }
    }
  }

  // Fallback to in-memory store
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map());
  }

  const store = stores.get(storeName)!;
  const now = Date.now();
  const entry = store.get(identifier) || { count: 0, lastReset: now };

  if (now - entry.lastReset > windowMs) {
    entry.count = 1;
    entry.lastReset = now;
  } else {
    entry.count++;
  }

  store.set(identifier, entry);

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.lastReset + windowMs,
  };
}
