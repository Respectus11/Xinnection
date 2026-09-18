"use client";

import { useTranslations } from "next-intl";
import { AlertDiamondIcon } from "./icons";

export function CrisisCard() {
  const t = useTranslations("crisis");
  return (
    <aside role="note" aria-label={t("bannerTitle")} className="crisis-card px-5 py-5">
      <div className="flex items-center gap-2">
        <span style={{ color: "#D96B58" }}>
          <AlertDiamondIcon className="h-4 w-4" />
        </span>
        <p className="display text-lg font-bold" style={{ color: "#D96B58" }}>
          {t("bannerTitle")}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(241,245,249,0.85)" }}>
        {t("bannerBody")}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: "rgba(226,232,240,0.8)" }}>
        {t("hospital")}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <a
            className="inline-flex items-center min-h-[44px] font-medium underline underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B58]"
            style={{ color: "#F87171", textDecorationColor: "rgba(248,113,113,0.5)" }}
            href="https://www.befrienders.org"
            target="_blank"
            rel="noreferrer"
          >
            {t("befrienders")} &rarr;
          </a>
        </li>
        <li>
          <a
            className="inline-flex items-center min-h-[44px] font-medium underline underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B58]"
            style={{ color: "#F87171", textDecorationColor: "rgba(248,113,113,0.5)" }}
            href="https://www.who.int/health-topics/mental-health"
            target="_blank"
            rel="noreferrer"
          >
            {t("who")} &rarr;
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs leading-relaxed" style={{ color: "rgba(203,213,225,0.8)" }}>
        {t("reviewNote")}
      </p>
    </aside>
  );
}
