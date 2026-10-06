import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { resolveClientIp } from "./lib/clientIp";

// Coarse per-instance flood guard (edge, in-memory). It is only a first line of
// defence: serverless instances do not share memory, so the authoritative
// limits live in Redis (lib/rateLimit.ts) on the sensitive routes.
// Security headers are set once, in next.config.ts, for every route.
const memoryCache = new Map<string, { count: number; expires: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;
const MAX_TRACKED = 5000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  if (memoryCache.size > MAX_TRACKED || Math.random() < 0.05) {
    for (const [key, value] of memoryCache.entries()) {
      if (value.expires < now) memoryCache.delete(key);
    }
    // Hard cap so a flood of spoofed identities cannot exhaust memory.
    if (memoryCache.size > MAX_TRACKED) memoryCache.clear();
  }

  const record = memoryCache.get(ip);
  if (!record || record.expires < now) {
    memoryCache.set(ip, { count: 1, expires: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
  record.count++;
  return true;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF defence in depth on top of SameSite=Lax: a state-changing API request
// that carries an Origin header must come from our own origin. Non-browser
// callers (cron with a shared secret) send no Origin and are unaffected.
function isCrossOriginMutation(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.nextUrl.host;
  } catch {
    return true;
  }
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const ip = resolveClientIp(request.headers);

  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": "60" } });
  }

  if (request.nextUrl.pathname.startsWith("/api")) {
    if (isCrossOriginMutation(request)) {
      return NextResponse.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403 });
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Includes /api (the previous matcher excluded any path containing a dot but
  // still covered /api; keep that behaviour, skip static assets and Next internals).
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
