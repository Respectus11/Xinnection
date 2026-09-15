"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

export type SavedResult = { code: string; threadId: string; crisisFlagged: boolean };

export function SeekerSavedCard({ saved }: { saved: SavedResult }) {
  const t = useTranslations("saved");
  const locale = useLocale();
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/${locale}/thread/${encodeURIComponent(saved.code)}`;
    try {
      window.localStorage.setItem("xinnection_active_code", saved.code);
    } catch {
      // Ignore
    }
    import("qrcode")
      .then((QR) => QR.toDataURL(url, { margin: 1, width: 180 }))
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [saved, locale]);

  const link = `${window.location.origin}/${locale}/thread/${encodeURIComponent(saved.code)}`;

  function copy(value: string, kind: "code" | "link") {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <section
      aria-labelledby="saved-title"
      className="card p-6 sm:p-8 animate-slide-up"
    >
      <h1 id="saved-title" className="display text-2xl font-bold" style={{ color: "#F1F5F9" }}>
        {t("title")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.76)" }}>
        {t("body")}
      </p>

      <ol className="mt-7 space-y-7">
        <li className="flex gap-3.5">
          <span className="num-chip num-chip-gold mt-0.5">1</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(148,163,184,0.85)" }}>
              {t("codeLabel")}
            </p>
            <p
              className="tnum mt-2 rounded-xl px-4 py-3 text-xl font-bold tracking-widest font-mono"
              style={{
                background: "rgba(34,153,130,0.12)",
                border: "1px solid rgba(78,216,189,0.35)",
                color: "#4ED8BD",
                letterSpacing: "0.14em",
              }}
            >
              {saved.code}
            </p>
            <Button variant="secondary" className="mt-2.5 text-xs" onClick={() => copy(saved.code, "code")}>
              {copied === "code" ? <CheckIcon /> : <CopyIcon />}
              {copied === "code" ? t("copied") : t("copy")}
            </Button>
          </div>
        </li>
        <li className="flex gap-3.5">
          <span className="num-chip num-chip-gold mt-0.5">2</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(148,163,184,0.85)" }}>
              {t("linkLabel")}
            </p>
            <p
              className="mt-2 break-all text-xs leading-relaxed font-mono"
              style={{ color: "rgba(148,163,184,0.7)" }}
            >
              {link}
            </p>
            <Button variant="ghost" className="mt-1 text-xs" onClick={() => copy(link, "link")}>
              {copied === "link" ? <CheckIcon /> : <CopyIcon />}
              {copied === "link" ? t("copiedLink") : t("copyLink")}
            </Button>
          </div>
        </li>
      </ol>

      {qrDataUrl && (
        <figure className="mt-7 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- QR is a locally generated data URL */}
          <img
            src={qrDataUrl}
            alt={t("qrLabel")}
            width={160}
            height={160}
            className="rounded-xl p-2"
            style={{
              background: "rgba(14,22,36,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <figcaption className="mt-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            {t("qrLabel")}
          </figcaption>
        </figure>
      )}

      <Button
        variant="primary"
        className="mt-8 w-full"
        onClick={() => router.push(`/thread/${encodeURIComponent(saved.code)}`)}
      >
        {t("continue")}
      </Button>
    </section>
  );
}
