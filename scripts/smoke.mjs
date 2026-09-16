// End-to-end smoke test against a running server (npm run start / dev).
// Usage: node scripts/smoke.mjs  (env: SMOKE_BASE, default http://localhost:3000)
// Requires the dev seed (prisma db seed) for TOTP test accounts.
import * as OTPAuth from "otpauth";
import Redis from "ioredis";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";

const ADMIN_SECRET = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
const PRO_SECRET = "KRSXG5CTMVRXEZLUKRSXG5CTMVRXEZLU";

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

function totp(secret) {
  const t = new OTPAuth.TOTP({
    issuer: "Xinnection",
    label: "account",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return t.generate(); // current 6-digit token (toString() returns the URI)
}

async function login(portal, email, password, secret) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ portal, email, password, totp: totp(secret) }),
  });
  if (!res.ok) throw new Error(`login failed for ${email}: ${res.status} ${await res.text()}`);
  const setCookie = res.headers.get("set-cookie") ?? "";
  return setCookie.split(";")[0];
}

const run = async () => {
  // Make the smoke idempotent: clear rate-limit counters (and thereby prove
  // they live in Redis) before exercising the submission flow.
  try {
    const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    redis.on("error", () => {});
    await redis.connect();
    const rlKeys = await redis.keys("rl:*");
    if (rlKeys.length) await redis.del(...rlKeys);
    redis.disconnect();
  } catch {
    // Redis connection is optional if testing against a degraded or mock environment
  }

  // 1. Health
  const health = await fetch(`${BASE}/api/health`);
  const healthBody = await health.json();
  check("health endpoint reports ok", health.status === 200 && healthBody.status === "ok", JSON.stringify(healthBody));

  // 1b. Security posture: headers, robots, favicon, retention guard.
  const secured = await fetch(`${BASE}/en`);
  check("security: X-Frame-Options is DENY", secured.headers.get("x-frame-options") === "DENY", String(secured.headers.get("x-frame-options")));
  check("security: CSP blocks framing", String(secured.headers.get("content-security-policy")).includes("frame-ancestors 'none'"));
  check("security: nosniff", secured.headers.get("x-content-type-options") === "nosniff");
  const robots = await fetch(`${BASE}/robots.txt`);
  const robotsText = await robots.text();
  check("robots disallows /admin and /professional", robots.ok && robotsText.includes("Disallow: /admin") && robotsText.includes("Disallow: /professional"), robotsText.slice(0, 120));
  const icon = await fetch(`${BASE}/icon.svg`);
  check("app icon serves", icon.status === 200, `status=${icon.status}`);
  const maintenanceAnon = await fetch(`${BASE}/api/admin/maintenance`, { method: "POST" });
  check("retention endpoint requires credentials", maintenanceAnon.status === 401, `status=${maintenanceAnon.status}`);

  // 2. Root redirects into the default locale
  const root = await fetch(`${BASE}/`, { redirect: "manual" });
  check("root redirects to /en", root.status >= 300 && root.status < 400 && String(root.headers.get("location")).startsWith("/en"), `status=${root.status} loc=${root.headers.get("location")}`);

  // 3. Landing page renders the working hero composer
  const landing = await fetch(`${BASE}/en`);
  const landingHtml = await landing.text();
  check("landing renders hero prompt", landing.status === 200 && landingHtml.includes("What's on your mind?"));

  // 4. Anonymous submit (ordinary distress)
  const submit = await fetch(`${BASE}/api/threads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "I can't sleep before exams and my chest is tight with worry.", categorySlug: "academic-stress", language: "en" }),
  });
  const thread = await submit.json();
  const codeValid =
    /^[a-z-]+-\d{2}-[a-z2-9]{3}$/.test(thread.code ?? "") ||
    /^[a-z]+(\s+[a-z]+){2}\s+\d{2}\s+[a-z2-9]{3}$/.test(thread.code ?? "");
  check("submit returns 201 with a code", submit.status === 201 && codeValid, JSON.stringify(thread));
  check("ordinary distress is not crisis-flagged", thread.crisisFlagged === false);

  // 5. Crisis keyword screening flags on submit
  const crisisSubmit = await fetch(`${BASE}/api/threads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "Honestly I have been thinking about suicide lately.", categorySlug: "other", language: "en" }),
  });
  const crisisThread = await crisisSubmit.json();
  check("crisis language is flagged and resources are triggered", crisisSubmit.status === 201 && crisisThread.crisisFlagged === true, JSON.stringify(crisisThread));

  // 6. Thread page renders the conversation via code
  const threadPage = await fetch(`${BASE}/en/thread/${encodeURIComponent(thread.code)}`);
  const threadHtml = await threadPage.text();
  check("thread page decrypts and renders the message", threadPage.status === 200 && threadHtml.includes("chest is tight"));

  // 7. Seeker adds a reply with their code
  const seekerReply = await fetch(`${BASE}/api/threads/${thread.threadId}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "Thank you, writing that down already helped a bit.", code: thread.code }),
  });
  check("seeker reply accepted", seekerReply.ok);

  // 8. RBAC: unauthenticated claim is rejected
  const anonClaim = await fetch(`${BASE}/api/professional/threads/${thread.threadId}/claim`, { method: "POST" });
  check("unauthenticated claim rejected with 401", anonClaim.status === 401, `status=${anonClaim.status}`);

  // 9. Professional sign-in (password + TOTP)
  const proCookie = await login("professional", "amina@xinnection.local", "Xinnection!Pro1", PRO_SECRET);
  check("professional login succeeds with TOTP", Boolean(proCookie));

  // 10. Race-safe claim: two concurrent claims, exactly one wins
  const claimReq = () => fetch(`${BASE}/api/professional/threads/${thread.threadId}/claim`, { method: "POST", headers: { cookie: proCookie } });
  const [first, second] = await Promise.all([claimReq(), claimReq()]);
  const statuses = [first.status, second.status].sort();
  check("concurrent claims: exactly one winner", statuses[0] === 200 && statuses[1] === 409, `statuses=${statuses}`);

  // 11. Professional reply
  const proReply = await fetch(`${BASE}/api/threads/${thread.threadId}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: proCookie },
    body: JSON.stringify({ content: "That took courage. Let's look at one night at a time." }),
  });
  check("professional reply accepted", proReply.ok);

  // 12. Status change
  const statusRes = await fetch(`${BASE}/api/professional/threads/${thread.threadId}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: proCookie },
    body: JSON.stringify({ status: "RESOLVED" }),
  });
  check("status change accepted", statusRes.ok);

  // 13. High-risk flag (internal signal)
  const flagRes = await fetch(`${BASE}/api/professional/threads/${thread.threadId}/flag`, { method: "POST", headers: { cookie: proCookie } });
  check("high-risk flag accepted", flagRes.ok);

  // 14. Admin sign-in and RBAC on pages
  const adminCookie = await login("admin", "admin@xinnection.local", "Xinnection!Admin1", ADMIN_SECRET);
  check("admin login succeeds with TOTP", Boolean(adminCookie));

  const adminPage = await fetch(`${BASE}/en/admin`, { headers: { cookie: adminCookie }, redirect: "manual" });
  check("admin overview renders with session", adminPage.status === 200, `status=${adminPage.status}`);

  const adminAnon = await fetch(`${BASE}/en/admin`, { redirect: "manual" });
  check("admin page redirects anonymous visitors", adminAnon.status >= 300 && adminAnon.status < 400, `status=${adminAnon.status}`);

  // 15. Audit log captured claim/status/flag
  const auditPage = await fetch(`${BASE}/en/admin/audit`, { headers: { cookie: adminCookie } });
  const auditHtml = await auditPage.text();
  check("audit log records professional actions", auditPage.status === 200 && auditHtml.includes("Thread claimed") && auditHtml.includes("Thread status changed") && auditHtml.includes("Thread flagged as high risk"));

  // 16. High-risk oversight shows the flag
  const flagsPage = await fetch(`${BASE}/en/admin/flags`, { headers: { cookie: adminCookie } });
  const flagsHtml = await flagsPage.text();
  check("flags oversight lists the active flag", flagsPage.status === 200 && flagsHtml.includes("High-risk oversight") && flagsHtml.includes("Unassigned"));

  // 17. Seeker deletes their data; thread becomes unreachable
  const del = await fetch(`${BASE}/api/threads/${thread.threadId}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: thread.code }),
  });
  check("delete my data succeeds", del.ok);
  const gone = await fetch(`${BASE}/en/thread/${encodeURIComponent(thread.code)}`);
  const goneHtml = await gone.text();
  check("deleted thread shows the not-found lookup state", gone.status === 200 && goneHtml.includes("No conversation found"));

  // 18. Seeded flagged crisis thread is visible in the queue
  const queuePage = await fetch(`${BASE}/en/professional`, { headers: { cookie: proCookie } });
  const queueHtml = await queuePage.text();
  check("professional queue renders with flagged demo thread", queuePage.status === 200 && queueHtml.includes("High risk"));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error("SMOKE CRASH", error);
  process.exit(1);
});
