import bcrypt from "bcryptjs";
import { handleApiError, errorResponse } from "@/lib/api";
import { createSessionToken, setSessionCookie, type Role } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { totpRequired, verifyTotp } from "@/lib/totp";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Authentication Endpoint: /api/auth/login
 *
 * Supports credential validation for:
 * 1. Professional responders ("professional" portal)
 * 2. Administrative operators ("admin" portal)
 *
 * Security Architecture:
 * - Two throttles, both fail-closed: per IP+account (10 / 15 min) and per
 *   account across all IPs (20 / 15 min) so IP rotation cannot grind one account.
 * - Constant-time-ish behaviour: bcrypt always runs (against a dummy hash when
 *   the account does not exist) so response time does not reveal valid emails.
 * - Account status is only revealed AFTER the password is proven correct.
 * - TOTP second factor with replay protection (required in production).
 * - Issues an HttpOnly session cookie containing a signed JWT with a jti
 *   (revocable on logout).
 */
const DUMMY_HASH = bcrypt.hashSync("xinnection-dummy-password", 12);

export async function POST(request: Request) {
  try {
    let body: { portal?: string; email?: string; password?: string; totp?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const portal = body.portal === "admin" ? "admin" : "professional";
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    const password = String(body.password ?? "").slice(0, 256);
    const totp = String(body.totp ?? "").replace(/\s+/g, "");
    if (!email || !password) return errorResponse(400, "BAD_REQUEST");

    const ip = clientIpFromHeaders(request.headers);
    const [perIp, perAccount] = await Promise.all([
      rateLimit(`login-${portal}`, `${ip}:${email}`, 10, 900, { failClosed: true }),
      rateLimit(`login-acct-${portal}`, email, 20, 900, { failClosed: true }),
    ]);
    if (!perIp.ok || !perAccount.ok) return errorResponse(429, "RATE_LIMITED");

    const fail = () => errorResponse(401, "INVALID");
    const needTotp = totpRequired();

    if (portal === "professional") {
      const user = await prisma.professional.findUnique({ where: { email } });
      const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !passwordOk) return fail();
      if (needTotp || totp) {
        if (!(await verifyTotp(user.id, user.totpSecretEnc, totp))) return fail();
      }
      if (user.status === "SUSPENDED") return errorResponse(423, "SUSPENDED");
      if (user.status === "PENDING") return errorResponse(403, "PENDING");
      const token = await createSessionToken({ sub: user.id, role: "PROFESSIONAL", name: user.fullName });
      await setSessionCookie(token);
      return Response.json({ ok: true });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) return fail();
    if (needTotp || totp) {
      if (!(await verifyTotp(user.id, user.totpSecretEnc, totp))) return fail();
    }
    const token = await createSessionToken({ sub: user.id, role: user.role as Role, name: user.email });
    await setSessionCookie(token);
    await writeAudit({
      actorType: "ADMIN",
      actorId: user.id,
      action: "admin.login",
      targetType: "adminUser",
      targetId: user.id,
    }).catch(() => undefined);
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
