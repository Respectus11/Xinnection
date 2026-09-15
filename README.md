# Xinnection

An anonymous mental-health support platform for Ethiopia — *a quiet room to
speak*. Seekers write anonymously in whatever language they like (the
interface ships English-first; Amharic, Afaan Oromoo and Tigrinya content is
modeled end-to-end pending native-speaker review); verified professionals
respond; admins oversee safety.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- PostgreSQL via Prisma, Redis (rate limiting) — both via Docker Compose
- next-intl (UI ships `en`; content languages: `en`, `am` (Amharic), `om` (Afaan Oromoo), `ti` (Tigrinya))
- Auth: email + password + TOTP (bcrypt, jose JWT in an httpOnly cookie)
- Tests: Vitest

## Quick start

```powershell
docker compose up -d          # postgres + redis
npm install                   # also runs prisma generate
npx prisma migrate dev        # apply schema
npx prisma db seed            # categories, admin, professionals, demo threads
npm run dev                   # http://localhost:3000
```

The seed prints demo seeker codes and `otpauth://` TOTP URIs — add them to
any authenticator app to sign in.

### Test credentials (development only)

| Role          | Email                    | Password          | TOTP seed (base32)              |
| ------------- | ------------------------ | ----------------- | ------------------------------- |
| Super Admin   | admin@xinnection.local   | Xinnection!Admin1 | JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP |
| Professional  | amina@xinnection.local   | Xinnection!Pro1   | KRSXG5CTMVRXEZLUKRSXG5CTMVRXEZLU |
| Pro (pending) | dawit@xinnection.local   | Xinnection!Pro2   | (same TOTP seed as above)       |

## Scripts

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server                       |
| `npm run build`     | Production build                 |
| `npm test`          | Vitest suite                     |
| `npm run lint`      | ESLint                           |
| `npm run db:up`     | Start Docker Postgres + Redis    |
| `npm run db:migrate`| Prisma migrate dev               |
| `npm run db:seed`   | Seed development data            |
| `npm run db:deploy` | Apply migrations (production)    |
| `npm run smoke`     | End-to-end smoke vs live server  |

## How it fits together

- **Seeker side** (`src/app/[locale]/(seeker)`): landing page whose hero is a
  working composer; category pills; crisis banner before submission; consent
  notice stored client-side; one-time anonymous code + QR; thread view with
  replies and friction-free "delete my data".
- **Professional side** (`(dash)/professional`): TOTP-gated queue with
  crisis-first sorting, race-safe atomic claim, case view sharing the same
  ThreadLine component, status control, single-click high-risk flag.
- **Admin side** (`(dash)/admin`): four stat blocks, onboarding approvals,
  suspend/reinstate with audited reasons, platform-wide high-risk oversight,
  filterable audit log, and the unclaimed-thread aging alert.
- **Libraries** (`src/lib`): envelope encryption per thread (`crypto.ts`),
  anonymous code generation (`token.ts`), Redis rate limiting with
  transiently hashed IPs (`rateLimit.ts`), API-layer RBAC (`auth.ts`), the
  single audit funnel (`audit.ts`), and crisis screening (`screening.ts`).

Design tokens live in `src/app/globals.css` (ink/dusk/mist/gold/eucalyptus/
flag, 1.25 modular scale, hairline borders instead of shadows). Fonts —
Fraunces (display serif) and Noto Sans + Noto Sans Ethiopic — are
self-hosted variable woff2 files; nothing is fetched from Google Fonts at
build time or runtime.

## Deployment

See `docs/DEPLOY.md` for the container build, migrations, retention cron,
key rotation and the pre-launch checklist. In short: fill the env matrix,
`docker compose build`, `docker compose run --rm migrate`,
`docker compose up -d app`, then run `npm run smoke` against the live host.

## Docs

- `docs/DEPLOY.md` — environment matrix, release steps, operations notes
- `docs/design-system.md` — tokens, type, motion and the avoid-list
- `docs/crisis-resources.md` — what is verified, what needs local review
- `docs/translation-review.md` — REQUIRED native review of am/om/ti copy
- `docs/security-notes.md` — threat-model decisions and leftovers

## Roadmap (not in this build)

PWA + offline drafts, 2G/3G performance budgets, email provider for staff
approvals, privacy-preserving CAPTCHA, log-scrubber config for error
tracking, crisis escalation runbook, penetration test and privacy audit.
