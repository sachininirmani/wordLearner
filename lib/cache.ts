type CacheItem<T> = { value: T; expiresAt: number };
const store = new Map<string, CacheItem<unknown>>();

export function getCache<T>(key: string): T | null {
  const item = store.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }
  return item.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
