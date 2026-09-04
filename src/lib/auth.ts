import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "./config";

export type Role = "PROFESSIONAL" | "ADMIN" | "SUPER_ADMIN";

export type SessionPayload = {
  sub: string;
  role: Role;
  name: string;
};

export const SESSION_COOKIE = config.sessionCookieName;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(config.authSecret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
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

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      sub: String(payload.sub),
      role: payload.role as Role,
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
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
