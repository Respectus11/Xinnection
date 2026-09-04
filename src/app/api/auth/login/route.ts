import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import { handleApiError, errorResponse } from "@/lib/api";
import { createSessionToken, setSessionCookie, type Role } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unwrapSecret } from "@/lib/crypto";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";

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
    const totp = String(body.totp ?? "").trim();
    if (!email || !password || !totp) return errorResponse(400, "BAD_REQUEST");

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
      if (!verifyTotp(user.totpSecretEnc, totp)) return fail();
      const token = await createSessionToken({ sub: user.id, role: "PROFESSIONAL", name: user.fullName });
      await setSessionCookie(token);
      return Response.json({ ok: true });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return fail();
    if (!(await bcrypt.compare(password, user.passwordHash))) return fail();
    if (!verifyTotp(user.totpSecretEnc, totp)) return fail();
    const token = await createSessionToken({ sub: user.id, role: user.role as Role, name: user.email });
    await setSessionCookie(token);
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

function verifyTotp(wrappedSecret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: "Xinnection",
      label: "account",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(unwrapSecret(wrappedSecret)),
    });
    return totp.validate({ token, window: 1 }) !== null;
  } catch {
    return false;
  }
}
