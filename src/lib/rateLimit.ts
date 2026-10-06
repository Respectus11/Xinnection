import crypto from "node:crypto";
import { redis } from "./redis";
import { resolveClientIp } from "./clientIp";

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
// lesser risk. Security-critical scopes (login, code lookup) can opt in to
// fail-closed individually via the `failClosed` option.
const FAIL_OPEN = process.env.RATE_LIMIT_FAIL_OPEN !== "false";

function keyFor(scope: string, identity: string): string {
  const idHash = crypto.createHash("sha256").update(`${scope}:${identity}`).digest("hex").slice(0, 32);
  return `rl:${scope}:${idHash}`;
}

export async function rateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowSec: number,
  opts: { failClosed?: boolean } = {},
): Promise<RateLimitResult> {
  const key = keyFor(scope, identity);
  const failOpen = opts.failClosed ? false : FAIL_OPEN;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    if (count <= limit) return { ok: true, retryAfterSec: 0 };
    const ttl = await redis.ttl(key);
    return { ok: false, retryAfterSec: ttl > 0 ? ttl : windowSec };
  } catch {
    return { ok: failOpen, retryAfterSec: failOpen ? 0 : 30 };
  }
}

// Failure-only throttling: used for credential-style lookups (anonymous codes)
// where legitimate successful requests (e.g. the seeker's 4s poll) must not
// consume budget, but guessing must be throttled hard.
export async function isBlocked(scope: string, identity: string, limit: number): Promise<RateLimitResult> {
  const key = keyFor(scope, identity);
  try {
    const count = Number((await redis.get(key)) ?? 0);
    if (count < limit) return { ok: true, retryAfterSec: 0 };
    const ttl = await redis.ttl(key);
    return { ok: false, retryAfterSec: ttl > 0 ? ttl : 60 };
  } catch {
    // Fail-closed in production: if we cannot count guesses we must not serve
    // code lookups unthrottled. A Redis outage degrades the seeker flow rather
    // than the confidentiality of conversations. Dev stays usable without Redis.
    const closed = process.env.NODE_ENV === "production";
    return { ok: !closed, retryAfterSec: closed ? 30 : 0 };
  }
}

export async function recordFailure(scope: string, identity: string, windowSec: number): Promise<void> {
  const key = keyFor(scope, identity);
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
  } catch {
    // best-effort
  }
}

// Transient identity for rate limiting only — never persisted, never logged.
export function clientIpFromHeaders(headers: Headers): string {
  return resolveClientIp(headers);
}
