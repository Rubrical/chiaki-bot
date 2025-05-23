import NodeCache from "node-cache";

const DEFAULT_TTL = 60;
const FLUSH_INTERVAL = 60 * 60 * 24;
const cache = new NodeCache({ deleteOnExpire: true, stdTTL: DEFAULT_TTL });

export const CacheManager = {
    set: (key: string, value: any, ttl?: number): boolean =>
        cache.set(key, value, ttl ?? DEFAULT_TTL),
    get: <T =any>(key: string): T | undefined => cache.get(key),
    del: (key: string): number => cache.del(key),
    has: (key: string): boolean => cache.has(key),
    flush: (): void => cache.flushAll(),
};

setInterval(() => CacheManager.flush(), FLUSH_INTERVAL * 1000);
