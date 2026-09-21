import bcrypt from "bcryptjs";
import { handleApiError, errorResponse } from "@/lib/api";
import { createSessionToken, setSessionCookie, type Role } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";

/**
 * Authentication Endpoint: /api/auth/login
 *
 * Supports credential validation for:
 * 1. Professional responders ("professional" portal)
 * 2. Administrative operators ("admin" portal)
 *
 * Security Architecture:
 * - Rate limiting per IP + normalized email combination (max 10 attempts per 15-minute window).
 * - Constant-time password verification via bcrypt.
 * - Account status validation (rejects SUSPENDED and PENDING accounts with specific codes).
 * - Issues encrypted HttpOnly session cookie containing cryptographically signed JWT.
 */
export async function POST(request: Request) {
  try {
    let body: { portal?: string; email?: string; password?: string; totp?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const portal = body.portal === "admin" ? "admin" : "professional";
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) return errorResponse(400, "BAD_REQUEST");

    // Per-IP+account throttle on sign-in attempts.
    const rl = await rateLimit(
      `login-${portal}`,
      `${clientIpFromHeaders(request.headers)}:${email}`,
      10,
      900,
    );
    if (!rl.ok) return errorResponse(429, "RATE_LIMITED");

    const fail = () => errorResponse(401, "INVALID");

    if (portal === "professional") {
      const user = await prisma.professional.findUnique({ where: { email } });
      if (!user) return fail();
      if (user.status === "SUSPENDED") return errorResponse(423, "SUSPENDED");
      if (user.status === "PENDING") return errorResponse(403, "PENDING");
      if (!(await bcrypt.compare(password, user.passwordHash))) return fail();
      const token = await createSessionToken({ sub: user.id, role: "PROFESSIONAL", name: user.fullName });
      await setSessionCookie(token);
      return Response.json({ ok: true });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return fail();
    if (!(await bcrypt.compare(password, user.passwordHash))) return fail();
    const token = await createSessionToken({ sub: user.id, role: user.role as Role, name: user.email });
    await setSessionCookie(token);
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
