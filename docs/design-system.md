# Xinnection design system

One token set, one motif, one motion language across three registers:
**seeker** (mist, calm, editorial) · **professional** (dusk rail over mist, dense tool) ·
**admin** (data-dense hairline tables). The tokens below are the law — components never
hardcode hex values.

## Tokens (`src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#10161F` | primary text, focus rings on light |
| `dusk` | `#1B2A3D` | dashboard chrome, seeker footer only |
| `mist` | `#EDEFE4` | page background |
| `line` (mist-dark) | `#DCDFCF` | hairline borders, thread line |
| `gold` / `gold-deep` | `#C9A227` / `#A9871E` | the single accent: one primary CTA + selected states, never a wash |
| `eucalyptus` / `-deep` | `#4C7A6B` / `#3A5D50` | success/resolved; `-deep` is the darker stop for 4.5:1 small text |
| `flag` | `#B4432F` | crisis only — structure (left rule, whisper wash, weight), never alarm fills |

Elevation is layered (`--shadow-rest` → `--shadow-lift` → gold `--shadow-glow` on CTA hover).
Motion tokens: 80ms press · 150ms selection · 200ms modal fade+rise · 250ms thread-line
extend, one shared `--ease-soft`. `prefers-reduced-motion` kills everything globally.

## Typography

- Body/UI: **Noto Sans** (Latin) with **Noto Sans Ethiopic** companion — self-hosted
  variable woff2 in `src/app/fonts/`, so no build-time or runtime font fetches.
- Display (`display` class): **Fraunces** variable (optical-size axis), 600, line-height
  1.15, letter-spacing −0.005em. For a future Ethiopic locale, `data-script="ethiopic"`
  on `<html>` flips headings to Noto Sans Ethiopic 700 — no Latin serif on Ethiopic.
- No tracked-out caps anywhere. Kickers are sentence-case, `text-ink/55`.

## The craft layer

1. **Atmosphere** — `.atmosphere` (and `-dusk` variant): two fixed, asymmetric radial
   washes (gold ≈10%, eucalyptus ≈8%) bleeding off-canvas. Ambient light, not decoration.
2. **Grain** — fixed `body::after`, one inline SVG turbulence tile at ~3.5%. Never animated.
3. **Elevation** — cards/inputs rest at `--shadow-rest`, gain `--shadow-lift` on
   hover/focus. Only interactive surfaces lift.
4. **Motif** — `HighlandsMark`: highland silhouettes at dusk + meskel daisy, inline SVG,
   `aria-hidden`. Two presentations (`horizon` behind the seeker hero, `mark` small).
   Max once or twice per screen.
5. **Dimensional indicators** — `.pill-*` and `.num-chip*`: subtle gradient fills with
   soft inset highlights.

## The signature motion

`ThreadLine` (used by BOTH ends of a conversation): on a client refresh, newly-arrived
turns get `data-new="true"`; the vertical line segment scales down-from-top to meet the
new turn (250ms) while the turn fades+rises. Initial render never animates; refreshes
never replay the past. New replies announce via `role="status"`.

## Crisis register

`CrisisCard` (banner, aging alert) and flagged queue rows: white surface, 3px flag left
rule, ~4% flag wash, generous spacing, numbered steps. Reaching for the flag color is a
structural decision, never a background fill.

## Registers

- **Seeker**: 42rem column, `atmosphere` light, serif headings, dusk footer with the mark.
- **Professional**: dusk rail (`DashboardSidebar`, gold active edge, caseload readout) over
  mist `atmosphere` content; sticky filters; hairline rows; flag items always sort first.
- **Admin**: `hairline-table` + `tnum` numerics, stat strip with serif numerals, warm
  `EmptyState`s. No monospace, no ALL-CAPS, no jargon in seeker-facing copy.

## Hard rules (the avoid-list)

No terminal/monospace styling · no ALL_CAPS_SNAKE labels · no fake telemetry · no
percentage-stat trust badges · no crypto/security jargon toward seekers · no repeating
icon-card trios · no cream-on-cream terracotta · no giant gradient headlines · no arrows
appended to links · no middle-dot meta · no 3D/parallax/bobbing/gradient animation ·
no hover-lift on every card.
