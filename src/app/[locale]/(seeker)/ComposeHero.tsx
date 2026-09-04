"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CrisisResourceBanner } from "@/components/CrisisResourceBanner";
import { CATEGORY_DEFS } from "@/components/categories";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";

const CONSENT_KEY = "xinnection-consent-v1";

type SavedResult = { code: string; threadId: string; crisisFlagged: boolean };

// The hero of the landing page IS the working composer — not an illustration
// of one. Selecting the crisis category shows resources before submission;
// a server-side keyword hit adds them after submission too.
export function ComposeHero() {
  const t = useTranslations("landing");
  const tCats = useTranslations("categories");
  const tConsent = useTranslations("consent");
  const tSaved = useTranslations("saved");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [consentDone, setConsentDone] = useState(true);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [saved, setSaved] = useState<SavedResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    setConsentDone(window.localStorage.getItem(CONSENT_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!saved) return;
    const url = `${window.location.origin}/${locale}/thread/${encodeURIComponent(saved.code)}`;
    import("qrcode")
      .then((QR) => QR.toDataURL(url, { margin: 1, width: 180 }))
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [saved, locale]);

  const crisisSelected = CATEGORY_DEFS.find((c) => c.slug === selected)?.crisis === true;

  async function submit() {
    if (!selected || !content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setRateLimited(false);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: content.trim(), categorySlug: selected, language: locale }),
      });
      if (res.status === 429) {
        setRateLimited(true);
        return;
      }
      if (!res.ok) {
        setError(t("submitError"));
        return;
      }
      setSaved((await res.json()) as SavedResult);
    } catch {
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function copy(value: string, kind: "code" | "link") {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    });
  }

  if (saved) {
    const link = `${window.location.origin}/${locale}/thread/${encodeURIComponent(saved.code)}`;
    return (
      <section aria-labelledby="saved-title">
        <h1 id="saved-title" className="text-xl font-semibold">
          {tSaved("title")}
        </h1>
        <p className="mt-2 text-ink/80">{tSaved("body")}</p>
        {saved.crisisFlagged && (
          <div className="mt-4">
            <CrisisResourceBanner />
          </div>
        )}
        <div className="mt-6 border border-line bg-white p-4">
          <p className="text-sm font-medium text-ink/60">{tSaved("codeLabel")}</p>
          <p className="mt-1 text-2xl font-semibold tracking-wide">{saved.code}</p>
          <Button variant="secondary" className="mt-3" onClick={() => copy(saved.code, "code")}>
            {copied === "code" ? tSaved("copied") : tSaved("copy")}
          </Button>
          <p className="mt-4 text-sm font-medium text-ink/60">{tSaved("linkLabel")}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="break-all border border-line bg-mist px-2 py-1 text-sm">{link}</code>
            <Button variant="ghost" onClick={() => copy(link, "link")}>
              {copied === "link" ? tSaved("copiedLink") : tSaved("copyLink")}
            </Button>
          </div>
          {qrDataUrl && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR is a locally generated data URL */}
              <img src={qrDataUrl} alt={tSaved("qrLabel")} width={180} height={180} />
            </div>
          )}
        </div>
        <Button
          variant="primary"
          className="mt-6 w-full"
          onClick={() => router.push(`/thread/${encodeURIComponent(saved.code)}`)}
        >
          {tSaved("continue")}
        </Button>
      </section>
    );
  }

  return (
    <section>
      {!consentDone && (
        <div className="mb-8 border border-line bg-white p-4">
          <h2 className="font-semibold">{tConsent("title")}</h2>
          <p className="mt-1 text-ink/80">{tConsent("body")}</p>
          <p className="mt-2 text-sm font-semibold text-ink/70">{tConsent("limitsTitle")}</p>
          <p className="text-sm text-ink/80">{tConsent("limits")}</p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => {
              window.localStorage.setItem(CONSENT_KEY, "1");
              setConsentDone(true);
            }}
          >
            {tConsent("continue")}
          </Button>
        </div>
      )}

      {crisisSelected && (
        <div className="mb-6">
          <CrisisResourceBanner />
        </div>
      )}

      <h1 className="text-3xl font-semibold tracking-tight">{t("heroPrompt")}</h1>
      <p className="mt-2 text-ink/70">{t("heroHelper")}</p>

      <p className="mt-6 text-sm font-medium">{t("chooseCategory")}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t("chooseCategory")}>
        {CATEGORY_DEFS.map((c) => {
          const isSel = selected === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSelected(c.slug)}
              className={`border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                isSel ? "border-gold" : "border-ink/25 text-ink/80 hover:border-ink/50"
              }`}
            >
              {tCats(c.key)}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Textarea
          id="compose"
          aria-label={t("heroPrompt")}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          rows={6}
          placeholder={t("heroPrompt")}
        />
      </div>

      {rateLimited && (
        <p role="alert" className="mt-3 text-flag">
          {tCommon("rateLimited")}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-flag">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        className="mt-4 w-full"
        onClick={submit}
        disabled={submitting || !content.trim() || !selected}
      >
        {submitting ? t("sending") : t("send")}
      </Button>
    </section>
  );
}
