"use client";

import { useTranslations } from "next-intl";

// The most safety-critical component on the seeker side. Shown immediately
// when the crisis category is selected and when screening flags a message.
// Links point to real, verifiable international directories; local
// Ethiopian helpline slots are pending verification — see
// docs/crisis-resources.md before launch.
export function CrisisResourceBanner() {
  const t = useTranslations("crisis");
  return (
    <aside role="note" aria-label={t("bannerTitle")} className="border border-flag px-4 py-4">
      <p className="font-semibold text-flag">{t("bannerTitle")}</p>
      <p className="mt-1 text-ink/80">{t("bannerBody")}</p>
      <p className="mt-2">{t("hospital")}</p>
      <ul className="mt-2 space-y-1">
        <li>
          <a
            className="underline underline-offset-4"
            href="https://www.befrienders.org"
            target="_blank"
            rel="noreferrer"
          >
            {t("befrienders")}
          </a>
        </li>
        <li>
          <a
            className="underline underline-offset-4"
            href="https://www.who.int/health-topics/mental-health"
            target="_blank"
            rel="noreferrer"
          >
            {t("who")}
          </a>
        </li>
      </ul>
      <p className="mt-2 text-xs text-ink/50">{t("reviewNote")}</p>
    </aside>
  );
}
