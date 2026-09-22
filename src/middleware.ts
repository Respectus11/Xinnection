import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Simple in-memory store for rate limiting (fallback if redis not configured)
const memoryCache = new Map<string, { count: number; expires: number }>();

function checkRateLimit(ip: string): boolean {
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 60; // 60 requests per minute per IP
  const now = Date.now();
  
  // Garbage collect expired entries randomly (10% chance) to prevent memory leak
  if (Math.random() < 0.1) {
    for (const [key, value] of memoryCache.entries()) {
      if (value.expires < now) memoryCache.delete(key);
    }
  }
  
  const record = memoryCache.get(ip);
  if (!record || record.expires < now) {
    memoryCache.set(ip, { count: 1, expires: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Extract client IP
  const ip = request.headers.get("x-forwarded-for") ?? request.ip ?? "127.0.0.1";
  
  // Rate Limit check
  const isAllowed = checkRateLimit(ip);
  
  if (!isAllowed) {
    return new NextResponse("Too Many Requests - Rate Limit Exceeded", { status: 429 });
  }

  // Security Headers against XSS and Clickjacking
  const response = intlMiddleware(request);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  return response;
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
