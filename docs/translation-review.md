# Translation review — REQUIRED before launch

English (`messages/en.json`) is the source of truth. The Amharic, Afaan
Oromoo, and Tigrinya files were produced with machine assistance and are
**not launch-ready** until a native speaker for each language has reviewed
them. This is especially critical because our audience may be in distress.

## Review priority (highest first)

1. `crisis` namespace — crisis banner copy in all three languages.
2. Screening keyword lists in `src/lib/screening.ts` (Amharic, Afaan Oromoo,
   Tigrinya arrays are marked `REVIEW REQUIRED` inline). False negatives here
   are safety failures; false positives are trust failures.
3. `consent` namespace — what anonymity covers and its limits.
4. `saved`, `lookup`, `thread` — the anonymous-code flow (deletion copy,
   cannot-recover copy).
5. Everything else (`landing`, `auth`, `queue`, `case`, `admin`, `nav`,
   `status`, `categories`, `proStatus`, `labels`, `source`,
   `auditActions`).

## Reviewer checklist per language

- [ ] Natural, plain, sentence-case phrasing — no jargon, no exclamation
      points, no forced positivity.
- [ ] Buttons say exactly what they do ("Send", "Delete this conversation").
- [ ] Crisis and consent copy verified by a second reader.
- [ ] Ethiopic text renders correctly in Noto Sans Ethiopic at all weights
      used (400/500/600/700).
- [ ] No untranslated English strings remain.

When a namespace is signed off, record reviewer + date in this file.
