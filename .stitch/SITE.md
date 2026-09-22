# SITE.md - Xinnection

## 1. Core Identity
- **Project Name**: Xinnection
- **Stitch Project ID**: [Pending Generation]
- **Mission**: An anonymous mental-health support platform for Ethiopia — *a quiet room to speak*. A safe, secure, and respectful environment for those seeking help and the verified professionals providing it.
- **Target Audience**: 
  1. Seekers (Ethiopian general public, mobile-first, high stress/vulnerability).
  2. Verified Professionals (Therapists, counselors, desktop-first, triage-focused).
  3. Administrators (Oversight, audits).
- **Voice**: Empathetic, deeply secure, professional, and entirely calm.

## 2. Visual Language
- **Vibe (Adjectives)**: Ceramic, Graphite, Refined, Modern, Airy (Seekers) / Dense (Professionals), Safe.

## 3. Architecture & File Structure
- **Framework**: Next.js 15 (App Router) + Tailwind CSS v4.
- **Root Directory**: `src/app/[locale]/`
- **Asset Flow**: Generated in `.stitch/designs/` → extracted to `src/app/[locale]/` and `src/components/` using `react-components`.
- **Navigation Strategy**:
  - **Seekers**: Bottom sticky action bar (mobile optimized).
  - **Professionals & Admins**: Persistent left sidebar rail + sticky table headers (desktop optimized).

## 4. Live Sitemap
- `[ ] index` (Seeker Landing Page & Composer)
- `[ ] seeker-code` (Anonymous Token & QR View)
- `[ ] seeker-thread` (Anonymous Chat & Reply Interface)
- `[ ] auth-login` (Professional & Admin Sign-in)
- `[ ] pro-queue` (Professional Triage Dashboard)
- `[ ] pro-case` (Professional Case/Thread Response View)
- `[ ] admin-overview` (Admin Analytics & Alerts)
- `[ ] admin-onboarding` (Professional Approvals)
- `[ ] admin-audit` (System Audit Logs)

## 5. The Roadmap (Backlog)
### High Priority
- **Seeker Landing Page**: Clean, 1-column mobile-first layout with a working composer, category pills, and crisis banner.
- **Seeker Thread**: Friction-free chat view with "delete my data" button (mobile-first).
- **Professional Queue**: High-density desktop triage board with crisis sorting and atomic claim buttons.
- **Professional Case**: Desktop-first split pane showing the thread history and response input.
- **Auth Login**: Secure TOTP-gated sign-in screen for staff.

### Medium Priority
- **Admin Overview**: Dashboard with 4 stat blocks and unclaimed-thread alerts.
- **Admin Onboarding**: Approval list for new professionals.
- **Seeker Token View**: High-contrast, easily screenshot-able page showing their recovery token/QR.

### Low Priority
- **Admin Audit**: Filterable log view for suspend/reinstate actions.
- **Global Error States**: Refined 404 and 500 error pages utilizing the new design system.

## 6. Creative Freedom Guidelines
When interpreting the UI, adhere strictly to the `DESIGN.md`. For seekers, prioritize psychological safety through massive whitespace and clear, unambiguous typography. For professionals, prioritize operational efficiency through data density and distinct visual cues for crisis flags. Avoid all generic AI cliches (e.g., no emojis, no fake data, no neon).
