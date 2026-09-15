import Redis from "ioredis";
import { config } from "./config";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(config.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 2 ? null : Math.min(times * 500, 2000)),
    enableOfflineQueue: false,
  });

redis.on("error", (err) => {
  // Loud, but content-free: log no request data, no IPs, no keys.
  console.warn("[redis] connection issue (rate limiting degraded):", err.message);
});

// Cached on globalThis unconditionally: route modules can be instantiated
// per request context in some runtimes, and one shared client per process
// is correct in both development and production.
globalForRedis.redis = redis;
