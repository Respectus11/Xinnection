# Security design notes

Decisions baked into the code, and what is deliberately left for Phase 5.

## Anonymous codes (the seeker's only credential)

- Format `word-word-word-##-xxx`: 3 words from a 160-word list (~21.9 bits) +
  2 digits (6.6 bits) + 3 characters from a 30-character unambiguous alphabet
  (~14.7 bits) ≈ **43 bits** of entropy from a CSPRNG (`src/lib/token.ts`).
- The raw code is shown once, embedded in the saved link/QR, and only its
  HMAC-SHA-256 hash (peppered via `TOKEN_PEPPER`) is stored.
- Brute force is bounded by lookup rate limiting: 30 code lookups/hour per
  transiently-hashed IP and 20 seeker messages/hour. At that rate, expect
  millions of years to hit a live code; deleting a thread invalidates its
  hash permanently.

## Rate limiting vs. the "no IP anywhere" rule

Rate limiting needs to *process* an IP; the architectural rule is that IPs
must never be **persisted or logged**. The reconciliation (`src/lib/rateLimit.ts`):

- The IP is hashed (SHA-256, scoped, truncated) into a Redis key.
- Keys live only for the rate-limit window (minutes–1 hour) and expire.
- Nothing about the IP reaches Postgres, audit logs, or application logs.
- Redis is a fail-open dependency by design: availability of the seeker flow
  beats perfect spam prevention during an outage (errors are logged
  content-free).

## Application-layer encryption

- Per-thread random 32-byte DEK; message bodies sealed with AES-256-GCM
  (ciphertext + IV + auth tag stored per message).
- The DEK is wrapped with a versioned master key (`MSG_KEY_V1`, envelope
  pattern) — rotate by adding `MSG_KEY_V2`; the version travels with every
  ciphertext.
- TOTP shared secrets use the same wrapping scheme.
- "Delete my data" removes the session; cascade removes the thread, messages
  and flags, and the wrapped DEK dies with them. Caveat documented for
  Phase 5: backups retain ciphertext until their TTL — the wrapped-DEK design
  means those backups become unreadable once the master-key set is rotated
  past the backup's key version, or the backup TTL lapses.

## Logging discipline

- Application logs never contain message content, codes, tokens, or IPs.
  Redis errors log only the error message; API errors log the error object
  (Prisma errors do not embed message bodies).
- Audit log entries carry actor, action, target, and non-sensitive metadata
  (e.g. suspension reasons) — enforced by the single `writeAudit` funnel.
- Phase 5 remaining: explicit payload scrubbing in the error tracker.

## What is intentionally deferred (Phase 5 of the spec)

- Anonymous-session auto-expiry job (30–90 days) + user-facing warning.
- CAPTCHA on submission — use a privacy-preserving option (Cloudflare
  Turnstile / hCaptcha), NOT reCAPTCHA, which conflicts with the
  no-fingerprint rule.
- Human-tuned content filtering beyond the keyword safety net.
- Crisis escalation runbook + third-party penetration test + privacy audit.
