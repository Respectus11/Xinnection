// Next.js instrumentation hook — runs once when the server process starts
// (not during `next build`, so CI builds without secrets still succeed).
// Production boots are refused unless the secret material is present and
// well-formed; development keeps its zero-setup fallbacks (lib/config.ts).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const { assertProductionEnv } = await import("./lib/env");
    assertProductionEnv();
  }
}
