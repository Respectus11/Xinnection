"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

export type SavedResult = { code: string; threadId: string; crisisFlagged: boolean };

// The keepsake moment: the anonymous code presented like a printed receipt —
// numbered steps, generous type, a QR to carry it to another device. This is
// the riskiest moment of the product (a lost code is unrecoverable), so it
// gets the warmest, slowest layout on the seeker side.
export function SeekerSavedCard({ saved }: { saved: SavedResult }) {
  const t = useTranslations("saved");
  const locale = useLocale();
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/${locale}/thread/${encodeURIComponent(saved.code)}`;
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
    <section aria-labelledby="saved-title" className="card p-6 sm:p-8">
      <h1 id="saved-title" className="display text-2xl text-ink">
        {t("title")}
      </h1>
      <p className="mt-2 text-ink/80">{t("body")}</p>

      <ol className="mt-7 space-y-7">
        <li className="flex gap-3.5">
          <span className="num-chip num-chip-gold mt-0.5">1</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink/80">{t("codeLabel")}</p>
            <p className="tnum mt-2 rounded-md border border-line bg-white px-3.5 py-3 text-xl font-semibold tracking-wide text-ink shadow-rest">
              {saved.code}
            </p>
            <Button variant="secondary" className="mt-2.5" onClick={() => copy(saved.code, "code")}>
              {copied === "code" ? <CheckIcon /> : <CopyIcon />}
              {copied === "code" ? t("copied") : t("copy")}
            </Button>
          </div>
        </li>
        <li className="flex gap-3.5">
          <span className="num-chip num-chip-gold mt-0.5">2</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink/80">{t("linkLabel")}</p>
            <p className="mt-2 break-all text-sm leading-relaxed text-ink/70">{link}</p>
            <Button variant="ghost" className="mt-1" onClick={() => copy(link, "link")}>
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
            className="rounded-md border border-line bg-white p-2 shadow-rest"
          />
          <figcaption className="mt-2 text-xs text-ink/65">{t("qrLabel")}</figcaption>
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
