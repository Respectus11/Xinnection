# Deployment guide

The product ships as a self-contained Next.js standalone bundle behind
Postgres + Redis. Everything below assumes a host with Docker; the app itself
is stateless, so scaling is just more containers behind your load balancer.

## 1. Environment

Copy `.env.example` to `.env` and fill it in. Everything is required unless
marked optional; `src/instrumentation.ts` refuses to boot a production server
when anything is missing or malformed (variable **names** are logged, never
values).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis for rate limiting |
| `AUTH_SECRET` | ≥32 bytes base64 — signs staff session JWTs |
| `MSG_KEY_V1` | exactly 32 bytes base64 — wraps per-thread message keys |
| `TOKEN_PEPPER` | ≥16 chars — HMAC pepper for anonymous codes |
| `MAINTENANCE_SECRET` | optional — retention-cron shared secret |
| `RATE_LIMIT_FAIL_OPEN` | `true` (default) or `false` when Redis is down |

Generate secrets with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

For docker compose networking, point the hosts at the service names:

```
DATABASE_URL="postgresql://xinnection:xinnection@db:5432/xinnection?schema=public"
REDIS_URL="redis://redis:6379"
```

## 2. Release steps

```bash
docker compose build                      # app image (standalone output)
docker compose up -d db redis             # or rely on depends_on
docker compose run --rm migrate           # prisma migrate deploy (tools profile)
docker compose up -d app                  # healthcheck-gated start
curl -fsS http://<host>:3000/api/health   # expect {"status":"ok"}
SMOKE_BASE=http://<host>:3000 npm run smoke
```

`npm run db:seed` is development-only and refuses to run with
`NODE_ENV=production` (it prints staff credentials to stdout).

## 3. Scheduled maintenance (retention)

The retention promise — anonymous sessions expire after `anonSessionDays`
(default 90) — is enforced by purging expired sessions. The cascade deletes
each session's threads, messages, crisis flags **and the wrapped message
key**, so ciphertext still sitting in old backups becomes unreadable.

Schedule daily:

```bash
curl -fsS -X POST https://<host>/api/admin/maintenance \
  -H "x-maintenance-secret: $MAINTENANCE_SECRET"
```

Every purge writes an audit entry ("Expired conversations purged") with the
deleted count. A SUPER_ADMIN can also trigger it from a session.

## 4. Key rotation (message encryption)

Message bodies are sealed with per-thread keys wrapped by `MSG_KEY_V1`. To
rotate: add `MSG_KEY_V2=<new 32-byte base64>` to the environment, raise
`LATEST_KEY_VERSION` in `src/lib/crypto.ts`, deploy. Old data stays readable
(the key version travels with every ciphertext); new writes use V2.
`docs/security-notes.md` documents the full envelope scheme.

## 5. Operations notes

- **Logs are content-free by policy** — no message text, no codes, no seeker
  IPs. Wire an error tracker to `handleApiError` and the client error
  boundary digests, and scrub captured arguments/stack locals.
- **CSP** is strict and self-contained. If analytics ever become necessary,
  extend `script-src`/`connect-src` in `next.config.ts` deliberately — never
  add a blanket `unsafe-inline`.
- **Rollback**: images are immutable; redeploy the previous tag. Schema
  changes so far are additive — if one ever needs reverting, run
  `migrate deploy` from the previous tag's checkout.
- **Backups**: treat message ciphertext as sensitive regardless of
  encryption; retention makes restored old data unreadable only after the
  key rows have themselves aged out of the backup window.

## 6. Pre-launch checklist

- [ ] Env matrix filled; `AUTH_SECRET` / `MSG_KEY_V1` / `TOKEN_PEPPER` are fresh, never shared with dev
- [ ] `migrate deploy` ran against the production database
- [ ] Smoke suite green against the live host (`SMOKE_BASE=… npm run smoke`)
- [ ] `docs/crisis-resources.md` local helpline slots verified by a human
- [ ] Retention cron scheduled and executed once successfully
- [ ] Error tracker wired; log scrubbing verified
- [ ] TLS terminated in front of the app (the app already sends HSTS)
