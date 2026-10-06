// Central runtime configuration. All values come from environment variables;
// dev fallbacks exist ONLY to make local development and tests runnable and
// must never be relied on in production (see .env.example).
//
// In production the fallbacks are refused outright (not only at boot via
// instrumentation.ts): any module that reads a missing secret throws, so an
// edge/preview/worker runtime can never silently sign sessions with a known
// constant. `next build` is exempt (NEXT_PHASE) so CI builds need no secrets.
const isProd = process.env.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

function secret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProd && !isBuild) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return devFallback;
}

export const config = {
  authSecret: secret("AUTH_SECRET", "dev-only-insecure-secret"),
  tokenPepper: secret("TOKEN_PEPPER", "dev-only-token-pepper"),
  sessionCookieName: "xinnection_session",
  sessionTtlHours: 12,
  // Anonymous sessions auto-expire after this many days of the conversation
  // existing (spec: 30–90 days; the expiry job itself is a Phase 5 item).
  anonSessionDays: 90,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  // Optional shared secret for the retention cron (POST
  // /api/admin/maintenance with header x-maintenance-secret). Unset = only a
  // SUPER_ADMIN session may trigger a purge.
  maintenanceSecret: process.env.MAINTENANCE_SECRET,
  // An unclaimed thread older than this surfaces in the admin overview alert.
  unclaimedAlertHours: 24,
} as const;
