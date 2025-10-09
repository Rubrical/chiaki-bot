import IORedis, { Redis }  from "ioredis";
import { valkeyHost } from "../config/env-config";

const DEFAULT_TTL = 180;
const NAMESPACE = "bot";
const PREFIX = NAMESPACE.endsWith(":") ? NAMESPACE : `${NAMESPACE}:`;
const pendingPromises = new Map<string, Promise<any>>();
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;
  const url = process.env.REDIS_URL || `redis://${valkeyHost}:6379/0`;
  _redis = new IORedis(url, {
    retryStrategy(times) {
      return Math.min(1000 * 2 ** times, 30000);
    },
    maxRetriesPerRequest: 30,
    enableReadyCheck: true,
  });
  return _redis;
}

const k = (key: string) => `${PREFIX}${key}`;

function toJSON(value: any): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
function fromJSON<T = any>(raw: string | null): T | undefined {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

export const CacheManager = {
  set: async (key: string, value: any, ttl?: number): Promise<boolean> => {
    const redis = getRedis();
    const secs = ttl ?? DEFAULT_TTL;
    await redis.set(k(key), toJSON(value), "EX", secs);
    return true;
  },

  get: async <T = any>(key: string): Promise<T | undefined> => {
    const redis = getRedis();
    const raw = await redis.get(k(key));
    return fromJSON<T>(raw);
  },

  del: async (key: string): Promise<number> => {
    const redis = getRedis();
    return redis.del(k(key));
  },

  has: async (key: string): Promise<boolean> => {
    const redis = getRedis();
    const n = await redis.exists(k(key));
    return n === 1;
  },

  flush: async (): Promise<void> => {
    const redis = getRedis();
    const stream = redis.scanStream({
      match: k('*'),
      count: 100,
    });

    for await (const keys of stream) {
      if (Array.isArray(keys) && keys.length > 0) {
        await redis.del(...keys);
      }
    }
  },

  flushPattern: async (pattern: string): Promise<void> => {
    const redis = getRedis();
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    for await (const keys of stream) {
      if (Array.isArray(keys) && keys.length > 0) {
        await redis.del(...keys);
      }
    }
  },

  getOrSet: async <T = any>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>
  ): Promise<T> => {
    const hit = await CacheManager.get<T>(key);
    const pending = pendingPromises.get(key);

    if (hit !== undefined) return hit;
    if (pending) return pending;

    const promise = loader();
    pendingPromises.set(key, promise);

    try {
      const value = await promise;
      await CacheManager.set(key, value, ttlSeconds);
      return value;
    } finally {
     pendingPromises.delete(key);
    }
  },

  connection: (): Redis => getRedis(),
};
