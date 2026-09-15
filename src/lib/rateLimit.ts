import crypto from "node:crypto";
import { redis } from "./redis";

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

// Fixed-window counter in Redis. Scope + identity are hashed into the key so
// no raw identifier (e.g. an IP) is ever persisted in Redis or anywhere else,
// and keys expire by themselves. This is how we reconcile "rate limit abuse"
// with the architectural rule of never logging seeker IPs: the IP is
// processed transiently and exists only inside a short-TTL Redis key.
// Fail-open by default: when Redis is down, availability of the seeker flow
// matters more than perfect spam prevention (docs/security-notes.md). The
// Redis client logs loudly. Operators can tighten this with
// RATE_LIMIT_FAIL_OPEN=false — e.g. if abuse ever makes availability the
// lesser risk.
const FAIL_OPEN = process.env.RATE_LIMIT_FAIL_OPEN !== "false";

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
    return { ok: FAIL_OPEN, retryAfterSec: FAIL_OPEN ? 0 : 30 };
  }
}

// Transient identity for rate limiting only — never persisted, never logged.
export function clientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
