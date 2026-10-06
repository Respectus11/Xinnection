import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { config } from "./config";
import { redis } from "./redis";

export type Role = "PROFESSIONAL" | "ADMIN" | "SUPER_ADMIN";

const ROLES: readonly Role[] = ["PROFESSIONAL", "ADMIN", "SUPER_ADMIN"];
const ISSUER = "xinnection";
const AUDIENCE = "xinnection-staff";

export type SessionPayload = {
  sub: string;
  role: Role;
  name: string;
  jti?: string;
  exp?: number;
};

export const SESSION_COOKIE = config.sessionCookieName;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(config.authSecret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${config.sessionTtlHours}h`)
    .sign(secretKey());
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: config.sessionTtlHours * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const role = payload.role as Role;
    if (!ROLES.includes(role) || !payload.sub) return null;
    return {
      sub: String(payload.sub),
      role,
      name: String(payload.name ?? ""),
      jti: payload.jti,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

async function isRevoked(jti: string | undefined): Promise<boolean> {
  if (!jti) return true; // tokens without a jti predate revocation support
  try {
    return (await redis.exists(`revoked:${jti}`)) === 1;
  } catch {
    return false; // Redis outage must not lock all staff out
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  if (await isRevoked(session.jti)) return null;
  return session;
}

// Server-side logout: blacklist the token id until its natural expiry so a
// stolen cookie is useless after the user signs out.
export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const session = await verifyToken(token);
    if (session?.jti && session.exp) {
      const ttl = Math.max(1, session.exp - Math.floor(Date.now() / 1000));
      try {
        await redis.set(`revoked:${session.jti}`, "1", "EX", ttl);
      } catch {
        /* best-effort */
      }
    }
  }
  await clearSessionCookie();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

// API-layer RBAC. Hiding UI is not access control — every professional and
// admin endpoint calls this before touching data, and a test asserts that
// unauthenticated requests are rejected (tests/rbac.test.ts).
export async function requireRole(roles: readonly Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "UNAUTHENTICATED", "Sign in required");
  if (!roles.includes(session.role)) throw new ApiError(403, "FORBIDDEN", "Insufficient role");
  return session;
}

// For professional endpoints that touch conversation data: additionally
// confirms the account is still ACTIVE, so a suspension takes effect
// immediately instead of when the 12h JWT expires.
export async function requireActiveProfessional(): Promise<SessionPayload> {
  const session = await requireRole(["PROFESSIONAL"]);
  const { prisma } = await import("./db");
  const pro = await prisma.professional.findUnique({
    where: { id: session.sub },
    select: { status: true },
  });
  if (!pro || pro.status !== "ACTIVE") throw new ApiError(403, "PROFESSIONAL_INACTIVE", "Account not active");
  return session;
}
