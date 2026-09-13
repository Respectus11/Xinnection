"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CrisisCard } from "@/components/ui/CrisisCard";
import { Dialog } from "@/components/ui/Dialog";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { CATEGORY_DEFS } from "@/components/categories";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";
import { SeekerSavedCard, type SavedResult } from "./SeekerSavedCard";

const CONSENT_KEY = "xinnection-consent-v1";

// The hero of the landing page is the working composer itself. Selecting the
// crisis category shows resources before submission; a server-side keyword
// hit adds them after submission too. Privacy is explained in one warm,
// plain sentence — never in security jargon.
export function SeekerComposer() {
  const t = useTranslations("landing");
  const tCats = useTranslations("categories");
  const tConsent = useTranslations("consent");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [consentDone, setConsentDone] = useState(true);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [saved, setSaved] = useState<SavedResult | null>(null);

  useEffect(() => {
    setConsentDone(window.localStorage.getItem(CONSENT_KEY) === "1");
  }, []);

  const crisisSelected =
    CATEGORY_DEFS.find((c) => c.slug === selected)?.crisis === true;

  async function submit() {
    if (!selected || !content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setRateLimited(false);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          categorySlug: selected,
          language: locale,
        }),
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

  if (saved) {
    return (
      <div>
        {saved.crisisFlagged && (
          <div className="mb-6">
            <CrisisCard />
          </div>
        )}
        <SeekerSavedCard saved={saved} />
      </div>
    );
  }

  return (
    <div>
      <Dialog
        open={!consentDone}
        onClose={() => setConsentDone(true)}
        labelledBy="consent-title"
        title={tConsent("title")}
        closeLabel={tCommon("close")}
      >
        <p className="mt-4 leading-relaxed text-ink/85">{tConsent("body")}</p>
        <p className="mt-4 text-sm font-semibold text-ink/75">{tConsent("limitsTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">{tConsent("limits")}</p>
        <Button
          variant="primary"
          className="mt-6 w-full"
          onClick={() => {
            window.localStorage.setItem(CONSENT_KEY, "1");
            setConsentDone(true);
          }}
        >
          {tConsent("continue")}
        </Button>
      </Dialog>

      <div className="relative">
        <HighlandsMark
          variant="horizon"
          className="pointer-events-none absolute -top-12 left-1/2 h-44 w-[140%] max-w-none -translate-x-1/2 text-dusk"
        />
        <div className="relative">
          <h1 className="display text-3xl text-ink sm:text-4xl">{t("heroPrompt")}</h1>
          <p className="mt-3 text-ink/70">{t("heroHelper")}</p>
          <p className="mt-2 text-sm text-ink/55">{t("privacyLine")}</p>
        </div>
      </div>

      {crisisSelected && (
        <div className="mt-8">
          <CrisisCard />
        </div>
      )}

      <p className="mt-10 text-sm font-semibold text-ink/80">{t("chooseCategory")}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("chooseCategory")}>
        {CATEGORY_DEFS.map((c) => {
          const isSel = selected === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSelected(c.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                isSel
                  ? "border-gold bg-gold/15 text-ink shadow-rest"
                  : "border-ink/25 bg-white/60 text-ink/80 hover:border-ink/50"
              }`}
            >
              {c.crisis && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flag/70" />}
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
          rows={7}
          placeholder={t("placeholder")}
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
        className="mt-4 w-full sm:w-auto sm:px-8"
        onClick={submit}
        disabled={submitting || !content.trim() || !selected}
      >
        {submitting ? t("sending") : t("send")}
      </Button>
    </div>
  );
}
