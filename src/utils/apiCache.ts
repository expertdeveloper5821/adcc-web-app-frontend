/**
 * Simple in-memory cache for API responses.
 * Prevents re-fetching when navigating between pages.
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/** Return cached data if still fresh, otherwise null */
export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data as T;
  }
  return null;
}

/** Store data in cache */
export function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/** Invalidate a specific key or all keys matching a prefix */
export function invalidateCache(keyOrPrefix?: string): void {
  if (!keyOrPrefix) {
    cache.clear();
    return;
  }
  // Delete exact match
  if (cache.has(keyOrPrefix)) {
    cache.delete(keyOrPrefix);
    return;
  }
  // Delete all keys starting with prefix
  for (const key of cache.keys()) {
    if (key.startsWith(keyOrPrefix)) {
      cache.delete(key);
    }
  }
}
