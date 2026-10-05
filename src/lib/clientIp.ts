// Client IP resolution, safe for both Node and Edge runtimes (no node:* imports).
//
// `X-Forwarded-For` is client-controlled for every hop BEFORE our trusted
// proxy, so taking its first entry lets an attacker rotate the value to evade
// every rate limit. We therefore prefer headers that the platform overwrites,
// and otherwise read the XFF entry appended by the Nth trusted proxy from the
// right (TRUSTED_PROXY_HOPS, default 1).
export function resolveClientIp(headers: Headers): string {
  const platform = headers.get("x-vercel-forwarded-for") ?? headers.get("cf-connecting-ip");
  if (platform) return platform.split(",")[0].trim();

  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? "1") || 1);
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[Math.max(0, parts.length - hops)];
  }
  return headers.get("x-real-ip") ?? "unknown";
}
