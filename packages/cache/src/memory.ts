import { LRUCache } from "lru-cache";

// Global cache to persist across requests in the same isolate
export const memoryCache = new LRUCache<string, any>({
  max: 500, // max 500 items
  ttl: 1000 * 60 * 5, // 5 minutes 
});

export default memoryCache;
