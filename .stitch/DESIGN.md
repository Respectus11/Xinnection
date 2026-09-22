# Design System: Xinnection (Vibrant Dark Mode)

## 1. Visual Theme & Atmosphere
A colorful, warm, and deeply inviting interface that breaks away from clinical minimalism. To protect the user's eyes (especially at night, for crisis moments), the application employs a highly premium, vibrant Dark Mode. The atmosphere feels empathetic, modern, and highly engaging. It uses rich, soft hues against a deep, dark canvas to create a sense of hope, energy, and approachability.

**Density:**
- **Seeker Flow:** "Daily App Balanced" (5/10) - Approachable, well-paced, engaging with colorful touchpoints.
- **Professional Flow:** "Cockpit Dense" (8/10) - Information-rich, tabular, utilizing color-coding for rapid triage.

**Variance:**
- "Offset Asymmetric" (7/10) - Dynamic and confident layouts that feel organic and human.

**Motion:**
- "Fluid CSS" (6/10) - Snappy, delightful interactions. Buttons have satisfying tactile bounce; category pills have engaging hover states.

## 2. Color Palette & Roles
We embrace a rich, multi-hued "Midnight Sunrise" palette. It combines deep, soothing darks with highly attractive, vibrant accents.
- **Canvas Deep Space** (`#09090B`) — A deeply soothing, dark background to protect the user's eyes.
- **Elevated Onyx** (`#18181B`) — Clean card and container fill.
- **Starlight White** (`#FAFAFA`) — Primary text for high contrast.
- **Muted Silver** (`#A1A1AA`) — Secondary text and descriptions.
- **Vibrant Coral** (`#FF6B6B`) — The primary accent color for major CTAs and "Submit" actions. Energetic and hopeful.
- **Azure Blue** (`#3B82F6`) — Secondary interactive color.
- **Pill Palette (Colorful)** — Category pills use attractive, vibrant backgrounds that pop beautifully against the dark canvas:
  - Mint (`#059669` bg / `#D1FAE5` text)
  - Lavender (`#4F46E5` bg / `#E0E7FF` text)
  - Peach (`#EA580C` bg / `#FFEDD5` text)
  - Rose (`#DB2777` bg / `#FCE7F3` text)

## 3. Typography Rules
- **Display:** `Outfit` (fallback: `Noto Sans Ethiopic`) — Round, friendly, modern, and highly legible. Used for bold, welcoming headlines.
- **Body:** `Outfit` (fallback: `Noto Sans Ethiopic`) — Clean, relaxed reading experience.
- **Mono:** `JetBrains Mono` — Strictly for the Professional Dashboard (timestamps, metrics).

## 4. Component Stylings
- **Buttons:** Fully rounded (pill shape). Solid Vibrant Coral with a subtle, warm shadow. Satisfying tactile press on click.
- **Cards:** Soft, large border radius (16px). Gentle, diffused drop shadow.
- **Category Pills:** Highly colorful, distinct vibrant backgrounds. They should look clickable, tactile, and visually delightful.
- **Inputs & Forms:** Floating labels with a soft Azure Blue focus ring. Deeply padded for mobile comfort. Text area backgrounds should use `Elevated Onyx`.

## 5. Layout Principles & Device Strategy
**Seeker Flow (STRICTLY MOBILE-FIRST):**
- Navigation and primary CTAs are sticky at the bottom for thumb reachability.
- The composer is the central focal point, framed attractively.
- The layout should feel like a premium iOS/Android consumer app, not a web form.

**Professional/Admin Flow (STRICTLY DESKTOP-FIRST):**
- Left sidebar nav, central triage list, right detail pane.
- Tabular data that uses color-coding to immediately draw the professional's eye to high-risk cases.

## 6. Anti-Patterns
- **NEVER** use emojis anywhere in the UI.
- **NEVER** use generic centered Hero sections for the public site.
- **NEVER** use fake, fabricated data (e.g., "99.9% uptime").
- **NEVER** use the "LABEL // YEAR" typography formatting.
