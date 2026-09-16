"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CrisisCard } from "@/components/ui/CrisisCard";
import { Dialog } from "@/components/ui/Dialog";
import { CATEGORY_DEFS } from "@/components/categories";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";
import {
  ShieldLockIcon,
  MessageBubbleIcon,
  GlobeNetworkIcon,
  AnxietyIcon,
  GriefIcon,
  RelationshipsIcon,
  AcademicIcon,
  FamilyIcon,
  WorkIcon,
  AlertDiamondIcon,
  HorizonIcon,
} from "@/components/ui/icons";
import { SeekerSavedCard, type SavedResult } from "./SeekerSavedCard";

const CONSENT_KEY = "xinnection-consent-v1";
const ACTIVE_CODE_KEY = "xinnection_active_code";

function CategoryGlyph({ slug }: { slug: string }) {
  switch (slug) {
    case "anxiety":
      return <AnxietyIcon className="h-3.5 w-3.5" />;
    case "grief":
      return <GriefIcon className="h-3.5 w-3.5" />;
    case "relationships":
      return <RelationshipsIcon className="h-3.5 w-3.5" />;
    case "academic-stress":
      return <AcademicIcon className="h-3.5 w-3.5" />;
    case "family":
      return <FamilyIcon className="h-3.5 w-3.5" />;
    case "work":
      return <WorkIcon className="h-3.5 w-3.5" />;
    case "crisis-self-harm":
      return <AlertDiamondIcon className="h-3.5 w-3.5" />;
    default:
      return <HorizonIcon className="h-3.5 w-3.5" />;
  }
}

export function SeekerComposer() {
  const t = useTranslations("landing");
  const tCats = useTranslations("categories");
  const tConsent = useTranslations("consent");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [consentDone, setConsentDone] = useState(true);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [saved, setSaved] = useState<SavedResult | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);

  useEffect(() => {
    setConsentDone(window.localStorage.getItem(CONSENT_KEY) === "1");
    const stored = window.localStorage.getItem(ACTIVE_CODE_KEY);
    if (stored && stored.trim()) {
      setActiveCode(stored.trim());
    }
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
          language: language || locale,
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
      const data = (await res.json()) as SavedResult;
      if (data.code) {
        window.localStorage.setItem(ACTIVE_CODE_KEY, data.code);
        setActiveCode(data.code);
      }
      setSaved(data);
    } catch {
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-[68rem] px-5 py-10 sm:px-8">
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
    <>
      {/* Consent dialog */}
      <Dialog
        open={!consentDone}
        onClose={() => setConsentDone(true)}
        labelledBy="consent-title"
        title={tConsent("title")}
        closeLabel={tCommon("close")}
      >
        <p className="mt-4 leading-relaxed text-sm" style={{ color: "rgba(241,245,249,0.85)" }}>
          {tConsent("body")}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "#D4AF6A" }}>
          {tConsent("limitsTitle")}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "rgba(226,232,240,0.7)" }}>
          {tConsent("limits")}
        </p>
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

      {/* Hero: full-viewport split layout */}
      <section
        className="relative min-h-[calc(100dvh-4rem)] flex flex-col lg:flex-row"
        aria-label="Message composer"
      >
        {/* LEFT: Hero image panel */}
        <div className="relative lg:w-[48%] xl:w-[52%] overflow-hidden bg-[#090D15]">
          {/* Image */}
          <Image
            src="/hero.png"
            alt="A rescuer climbing into a mind to reach someone in distress, representing our commitment to reach you"
            fill
            className="object-cover object-center"
            style={{ filter: "brightness(0.92) contrast(1.05)" }}
            priority
          />
          {/* Overlay gradient: subtle edge blend with composer */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(9,13,21,0.1) 0%, rgba(9,13,21,0.0) 50%, rgba(9,13,21,0.85) 90%, rgba(9,13,21,1) 100%)",
            }}
          />
          {/* Bottom vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(9,13,21,0.88) 0%, rgba(9,13,21,0.4) 40%, transparent 70%)",
            }}
          />

          {/* "We get you, we got you" overlay text */}
          <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12 lg:p-14 xl:p-16 min-h-[55vw] lg:min-h-0">
            <div className="animate-slide-up">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 backdrop-blur-md"
                style={{
                  background: "rgba(34,153,130,0.15)",
                  border: "1px solid rgba(78,216,189,0.3)",
                  color: "#4ED8BD",
                }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ED8BD] animate-glow-pulse" />
                Mental health support
              </span>
              <h1
                className="display text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05]"
                style={{ color: "#F1F5F9" }}
              >
                We get you, we got you.
              </h1>
              <p
                className="mt-4 max-w-sm text-base leading-relaxed animate-slide-up-d1"
                style={{ color: "rgba(226,232,240,0.76)" }}
              >
                You don&apos;t need a name. You don&apos;t need an account.
                Just write, a professional will be there.
              </p>
            </div>

            {/* Trust badges: bespoke vector iconography */}
            <div className="mt-8 flex flex-wrap gap-2.5 animate-slide-up-d2">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md"
                style={{
                  background: "rgba(14,22,36,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F1F5F9",
                }}
              >
                <span style={{ color: "#4ED8BD" }}>
                  <ShieldLockIcon className="h-4 w-4" />
                </span>
                Fully anonymous
              </span>

              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md"
                style={{
                  background: "rgba(14,22,36,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F1F5F9",
                }}
              >
                <span style={{ color: "#4ED8BD" }}>
                  <MessageBubbleIcon className="h-4 w-4" />
                </span>
                Real professionals
              </span>

              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md"
                style={{
                  background: "rgba(14,22,36,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F1F5F9",
                }}
              >
                <span style={{ color: "#4ED8BD" }}>
                  <GlobeNetworkIcon className="h-4 w-4" />
                </span>
                Any language
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Composer panel */}
        <div
          className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16 lg:py-16"
          style={{ background: "rgba(11,16,26,0.98)" }}
        >
          {/* Subtle architectural ambient highlight */}
          <div
            className="pointer-events-none absolute top-0 right-0 w-80 h-80 opacity-25"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(34,153,130,0.35), transparent 70%)",
            }}
            aria-hidden
          />

          <div className="relative max-w-lg mx-auto w-full animate-slide-up-d1">
            {/* Active conversation quick card if user already has an ongoing conversation */}
            {activeCode && (
              <div
                className="mb-6 rounded-2xl p-4 transition-all"
                style={{
                  background: "rgba(34, 153, 130, 0.12)",
                  border: "1px solid rgba(78, 216, 189, 0.35)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#4ED8BD] animate-glow-pulse" />
                      <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: "#4ED8BD" }}>
                        Ongoing conversation on this device
                      </p>
                    </div>
                    <p className="mt-1 text-xs font-mono" style={{ color: "rgba(241,245,249,0.9)" }}>
                      {activeCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.removeItem(ACTIVE_CODE_KEY);
                      setActiveCode(null);
                    }}
                    className="text-xs transition-colors hover:text-[#F1F5F9]"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                    title="Clear saved conversation"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/thread/${encodeURIComponent(activeCode)}`}
                    className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold no-underline transition-all"
                    style={{
                      background: "#229982",
                      color: "#090D15",
                      boxShadow: "0 2px 8px rgba(34,153,130,0.3)",
                    }}
                  >
                    Open your conversation &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile-only heading (hidden on lg where image panel shows it) */}
            <div className="mb-8 lg:hidden">
              <h1 className="display text-3xl sm:text-4xl font-bold" style={{ color: "#F1F5F9" }}>
                We get you, we got you.
              </h1>
              <p className="mt-2 text-sm" style={{ color: "rgba(226,232,240,0.65)" }}>
                {t("heroHelper")}
              </p>
            </div>

            {/* Desktop composer heading */}
            <div className="hidden lg:block mb-7">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#4ED8BD" }}
              >
                Share freely
              </p>
              <h2
                className="display mt-1.5 text-2xl xl:text-3xl font-bold tracking-tight"
                style={{ color: "#F1F5F9" }}
              >
                {t("heroPrompt")}
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgba(148,163,184,0.75)" }}>
                {t("privacyLine")}
              </p>
            </div>

            {crisisSelected && (
              <div className="mb-6">
                <CrisisCard />
              </div>
            )}

            {/* Category pills */}
            <p
              className="text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: "rgba(148,163,184,0.7)" }}
            >
              {t("chooseCategory")}
            </p>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label={t("chooseCategory")}
            >
              {CATEGORY_DEFS.map((c) => {
                const isSel = selected === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={isSel}
                    onClick={() => setSelected(c.slug)}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={
                      isSel
                        ? {
                            background: "rgba(34,153,130,0.18)",
                            border: "1px solid rgba(78,216,189,0.5)",
                            color: "#F1F5F9",
                            boxShadow: "0 0 16px rgba(34,153,130,0.25)",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(226,232,240,0.72)",
                          }
                    }
                  >
                    <span
                      style={{
                        color: isSel ? "#4ED8BD" : c.crisis ? "#D96B58" : "rgba(148,163,184,0.6)",
                      }}
                    >
                      <CategoryGlyph slug={c.slug} />
                    </span>
                    {tCats(c.key)}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <div className="mt-5">
              <Textarea
                id="compose"
                aria-label={t("heroPrompt")}
                value={content}
                onChange={(event) => {
                  const val = event.target.value;
                  setContent(val);
                  if (/[\u1200-\u137F]/.test(val) && language === "en") {
                    setLanguage("am");
                  }
                }}
                maxLength={5000}
                rows={6}
                placeholder={t("placeholder")}
              />
            </div>

            {/* Language selection pills */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgba(148,163,184,0.6)" }}>
                Language:
              </span>
              {[
                { code: "en", label: "English" },
                { code: "am", label: "አማርኛ" },
                { code: "om", label: "Afaan Oromoo" },
                { code: "ti", label: "ትግርኛ" },
              ].map((lang) => {
                const isLangSel = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    aria-pressed={isLangSel}
                    onClick={() => setLanguage(lang.code)}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                    style={
                      isLangSel
                        ? {
                            background: "rgba(34,153,130,0.22)",
                            border: "1px solid rgba(78,216,189,0.5)",
                            color: "#4ED8BD",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(148,163,184,0.7)",
                          }
                    }
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>

            {/* Char count */}
            {content.length > 0 && (
              <p
                className="mt-1.5 text-right text-xs tabular-nums"
                style={{ color: "rgba(148,163,184,0.6)" }}
              >
                {content.length} / 5000
              </p>
            )}

            {/* Alerts */}
            {rateLimited && (
              <p role="alert" className="mt-3 text-sm" style={{ color: "#D96B58" }}>
                {tCommon("rateLimited")}
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm" style={{ color: "#D96B58" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              variant="primary"
              className="mt-5 w-full shadow-lg"
              onClick={submit}
              disabled={submitting || !content.trim() || !selected}
            >
              {submitting ? t("sending") : t("send")}
            </Button>

            <p
              className="mt-3 text-center text-xs"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              {t("privacyLine")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

