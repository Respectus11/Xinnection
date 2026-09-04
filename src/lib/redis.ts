import Redis from "ioredis";
import { config } from "./config";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(config.redisUrl, {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 500, 5000),
    enableOfflineQueue: true,
  });

redis.on("error", (err) => {
  // Loud, but content-free: log no request data, no IPs, no keys.
  console.warn("[redis] connection issue (rate limiting degraded):", err.message);
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
