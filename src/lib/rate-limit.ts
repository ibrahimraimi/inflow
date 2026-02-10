type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const stores = new Map<string, RateLimitStore>();

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  storeName = "default",
) {
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
