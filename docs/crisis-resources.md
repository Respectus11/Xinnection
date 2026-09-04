# Crisis resources — content plan

The `CrisisResourceBanner` is the highest-stakes copy on the platform. This
document tracks what is real, what is placeholder, and what must be verified
before any public launch.

## Currently live in the component (all four languages)

1. **Immediate-danger instruction:** "Go to your nearest hospital emergency
   department, or call local emergency services." — universally true, no
   phone number to get wrong.
2. **Befrienders Worldwide** (https://www.befrienders.org) — a real,
   maintained worldwide directory of emotional-support helplines, including
   centers serving Ethiopia and the region.
3. **World Health Organization mental health resources**
   (https://www.who.int/health-topics/mental-health) — real, stable,
   multilingual.

## Open item before launch — REVIEW REQUIRED

- A vetted list of **Ethiopia-specific** helplines and services (Amharic,
  Afaan Oromoo, Tigrinya) with verified phone numbers, hours, and coverage.
  The component intentionally shows *no specific local numbers* until this
  verification is complete; the UI copy says exactly that ("Local helpline
  details are being verified for accuracy").
- The `reviewNote` string and this document must be removed/updated only
  after a named reviewer has confirmed each number.

## Process rules

- Crisis banner copy lives in `messages/*.json` under the `crisis` namespace
  and is flagged for native-speaker review in `docs/translation-review.md`.
- Never link a helpline that has not been verified within the last 6 months;
  record the verification date next to each entry here.
- Escalation runbook (who is notified when a high-risk flag appears, SLA,
  decision tree) is a Phase 5 deliverable and will be linked from here and
  from the admin flag UI.
