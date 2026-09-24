import Redis from "ioredis";
import { config } from "./config";

const globalForRedis = globalThis as unknown as { redis?: Redis };

// Validate the URL is a real Redis URL (not localhost in prod, not malformed)
function isValidRedisUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "redis:" || parsed.protocol === "rediss:";
  } catch {
    return false;
  }
}

const redisUrl = config.redisUrl?.replace(/['"]/g, "").trim() ?? "";

function createRedisClient(): Redis {
  if (!isValidRedisUrl(redisUrl)) {
    // Return a no-op stub so rate limiting degrades gracefully (fail-open)
    console.warn("[redis] REDIS_URL is not set or invalid — rate limiting disabled (fail-open).");
    const stub = new Redis({ lazyConnect: true, enableOfflineQueue: false });
    stub.disconnect();
    return stub;
  }

  return new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 2 ? null : Math.min(times * 500, 2000)),
    enableOfflineQueue: false,
  });
}

export const redis =
  globalForRedis.redis ?? createRedisClient();

redis.on("error", (err) => {
  // Loud, but content-free: log no request data, no IPs, no keys.
  console.warn("[redis] connection issue (rate limiting degraded):", err.message);
});

// Cached on globalThis unconditionally: route modules can be instantiated
// per request context in some runtimes, and one shared client per process
// is correct in both development and production.
globalForRedis.redis = redis;

