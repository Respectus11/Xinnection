// Production environment validation — fail fast, fail loud, leak nothing.
//
// The dev fallbacks in lib/config.ts exist so local development and tests run
// with zero setup. They must never silently guard a production deployment: a
// known constant signing staff sessions would be an authentication bypass.
// src/instrumentation.ts calls assertProductionEnv() once when a production
// server process starts (never during `next build`), and refuses to boot with
// a message that names the offending variable — never its value.

export type EnvProblem = { name: string; reason: string };

const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

function isBase64OfAtLeast(value: string, bytes: number): boolean {
  if (!B64.test(value)) return false;
  return Buffer.from(value, "base64").length >= bytes;
}

function problemsFor(env: Record<string, string | undefined>): EnvProblem[] {
  const problems: EnvProblem[] = [];

  const secret = env.AUTH_SECRET;
  if (!secret) {
    problems.push({ name: "AUTH_SECRET", reason: "missing — required to sign staff sessions" });
  } else if (!isBase64OfAtLeast(secret, 32)) {
    problems.push({ name: "AUTH_SECRET", reason: "must be base64 decoding to at least 32 bytes" });
  }

  const key = env.MSG_KEY_V1;
  if (!key) {
    problems.push({ name: "MSG_KEY_V1", reason: "missing — required to encrypt seeker messages" });
  } else if (!B64.test(key) || Buffer.from(key, "base64").length !== 32) {
    problems.push({ name: "MSG_KEY_V1", reason: "must be base64 decoding to exactly 32 bytes" });
  }

  const pepper = env.TOKEN_PEPPER;
  if (!pepper) {
    problems.push({ name: "TOKEN_PEPPER", reason: "missing — required to hash anonymous codes" });
  } else if (pepper.length < 16) {
    problems.push({ name: "TOKEN_PEPPER", reason: "must be at least 16 characters" });
  }

  if (!env.DATABASE_URL) problems.push({ name: "DATABASE_URL", reason: "missing" });
  if (!env.REDIS_URL) problems.push({ name: "REDIS_URL", reason: "missing" });

  return problems;
}

// Pure function — unit-tested in tests/env.test.ts.
export function validateProductionEnv(env: Record<string, string | undefined>): EnvProblem[] {
  return problemsFor(env);
}

export function assertProductionEnv(
  env: Record<string, string | undefined> = process.env,
): void {
  const problems = validateProductionEnv(env);
  if (problems.length > 0) {
    const detail = problems.map((p) => `  - ${p.name}: ${p.reason}`).join("\n");
    throw new Error(
      `Refusing to start: invalid production environment.\n${detail}\n` +
        "See .env.example for the expected shape. Variable values are never logged.",
    );
  }
}
