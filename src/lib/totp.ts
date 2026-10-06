import * as OTPAuth from "otpauth";
import { unwrapSecret } from "./crypto";
import { redis } from "./redis";

// REQUIRE_TOTP defaults to ON in production. The escape hatch exists only for
// operators who must recover accounts that were never enrolled.
export function totpRequired(): boolean {
  if (process.env.REQUIRE_TOTP === "false") return false;
  if (process.env.REQUIRE_TOTP === "true") return true;
  return process.env.NODE_ENV === "production";
}

// Verifies a 6-digit TOTP (±1 step drift) against the wrapped secret, and
// rejects replays of an already-used code within its validity window.
export async function verifyTotp(userId: string, wrappedSecret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;
  let delta: number | null;
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(unwrapSecret(wrappedSecret)),
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });
    delta = totp.validate({ token, window: 1 });
  } catch {
    return false;
  }
  if (delta === null) return false;
  try {
    const fresh = await redis.set(`totp-used:${userId}:${token}`, "1", "EX", 120, "NX");
    if (fresh !== "OK") return false; // replay
  } catch {
    // Redis down: accept (availability) — the code is still time-bound.
  }
  return true;
}
