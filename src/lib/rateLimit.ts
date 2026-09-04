import crypto from "node:crypto";
import { redis } from "./redis";

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

// Fixed-window counter in Redis. Scope + identity are hashed into the key so
// no raw identifier (e.g. an IP) is ever persisted in Redis or anywhere else,
// and keys expire by themselves. This is how we reconcile "rate limit abuse"
// with the architectural rule of never logging seeker IPs: the IP is
// processed transiently and exists only inside a short-TTL Redis key.
export async function rateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const idHash = crypto.createHash("sha256").update(`${scope}:${identity}`).digest("hex").slice(0, 32);
  const key = `rl:${scope}:${idHash}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    if (count <= limit) return { ok: true, retryAfterSec: 0 };
    const ttl = await redis.ttl(key);
    return { ok: false, retryAfterSec: ttl > 0 ? ttl : windowSec };
  } catch {
    // Fail open: when Redis is down, availability of the seeker flow matters
    // more than perfect spam prevention. The Redis client logs loudly.
    return { ok: true, retryAfterSec: 0 };
  }
}

// Transient identity for rate limiting only — never persisted, never logged.
export function clientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
