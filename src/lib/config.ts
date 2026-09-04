// Central runtime configuration. All values come from environment variables;
// dev fallbacks exist ONLY to make local development and tests runnable and
// must never be relied on in production (see .env.example).
export const config = {
  authSecret: process.env.AUTH_SECRET ?? "dev-only-insecure-secret",
  tokenPepper: process.env.TOKEN_PEPPER ?? "dev-only-token-pepper",
  sessionCookieName: "xinnection_session",
  sessionTtlHours: 12,
  // Anonymous sessions auto-expire after this many days of the conversation
  // existing (spec: 30–90 days; the expiry job itself is a Phase 5 item).
  anonSessionDays: 90,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  // An unclaimed thread older than this surfaces in the admin overview alert.
  unclaimedAlertHours: 24,
} as const;
