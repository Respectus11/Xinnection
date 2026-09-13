"use client";

import { useTranslations } from "next-intl";

// The most safety-critical component on the seeker side. Dignified by
// structure: a quiet white card, a flag-toned left rule, room to breathe —
// impossible to miss without ever being alarming. Links point to real,
// verifiable international directories; local helpline slots are pending
// verification — see docs/crisis-resources.md before launch.
export function CrisisCard() {
  const t = useTranslations("crisis");
  return (
    <aside role="note" aria-label={t("bannerTitle")} className="crisis-card px-5 py-5">
      <p className="display text-lg text-flag">{t("bannerTitle")}</p>
      <p className="mt-1.5 text-ink/85">{t("bannerBody")}</p>
      <p className="mt-3">{t("hospital")}</p>
      <ul className="mt-3 space-y-1.5">
        <li>
          <a
            className="font-medium underline decoration-flag/40 underline-offset-4 transition-colors duration-150 hover:decoration-flag"
            href="https://www.befrienders.org"
            target="_blank"
            rel="noreferrer"
          >
            {t("befrienders")}
          </a>
        </li>
        <li>
          <a
            className="font-medium underline decoration-flag/40 underline-offset-4 transition-colors duration-150 hover:decoration-flag"
            href="https://www.who.int/health-topics/mental-health"
            target="_blank"
            rel="noreferrer"
          >
            {t("who")}
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs text-ink/50">{t("reviewNote")}</p>
    </aside>
  );
}
