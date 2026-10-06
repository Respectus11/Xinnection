import { ApiError } from "./auth";
import { clientIpFromHeaders, isBlocked, recordFailure } from "./rateLimit";

// Anonymous-code lookups are credential checks: the code IS the password for a
// conversation. Only FAILED guesses consume budget, so the seeker's normal
// 4-second poll is unaffected while brute-force is throttled hard.
const SCOPE = "code-guess";
const MAX_FAILURES = 10;
const WINDOW_SEC = 15 * 60;

export async function assertCodeAttemptAllowed(headers: Headers): Promise<void> {
  const rl = await isBlocked(SCOPE, clientIpFromHeaders(headers), MAX_FAILURES);
  if (!rl.ok) throw new ApiError(429, "RATE_LIMITED", "Too many attempts");
}

export async function recordBadCode(headers: Headers): Promise<void> {
  await recordFailure(SCOPE, clientIpFromHeaders(headers), WINDOW_SEC);
}
