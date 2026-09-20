"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CrisisCard } from "@/components/ui/CrisisCard";
import { Dialog } from "@/components/ui/Dialog";
import { CATEGORY_DEFS } from "@/components/categories";
import { Button } from "@/components/ui/Button";
import {
  GlobeNetworkIcon,
  UserIcon,
  UsersGroupIcon,
  UsFlagIcon,
  EtFlagIcon,
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

/**
 * SeekerComposer: The central anonymous intake interface for people seeking support.
 *
 * Key Capabilities:
 * - One-time informed consent confirmation stored locally (privacy-preserving, no account required).
 * - Multi-category emotional distress tagging with immediate crisis detection.
 * - Ethiopic script detection (automatically selects Amharic when Ge'ez characters are typed).
 * - Up to 10,000 character free-form expression field.
 * - Client-side persistence of generated access codes into localStorage for frictionless return check-ins.
 * - Non-judgmental rate-limiting warnings and accessible error feedback.
 */
export function SeekerComposer() {
  const t = useTranslations("landing");
  const tCats = useTranslations("categories");
  const tConsent = useTranslations("consent");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Local state tracking consent, composer input, category tag, and reply language
  const [consentDone, setConsentDone] = useState(true);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(locale || "en");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [saved, setSaved] = useState<SavedResult | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);

  // Load prior consent acknowledgment and existing active device thread code on mount
  useEffect(() => {
    setConsentDone(window.localStorage.getItem(CONSENT_KEY) === "1");
    const stored = window.localStorage.getItem(ACTIVE_CODE_KEY);
    if (stored && stored.trim()) {
      setActiveCode(stored.trim());
    }
  }, []);

  // Check if currently selected category warrants crisis guidance card
  const crisisSelected =
    CATEGORY_DEFS.find((c) => c.slug === selected)?.crisis === true;

  /**
   * Dispatches the anonymous encrypted thread creation request to the API.
   * On success, records the recovery code to localStorage for returning visits.
   */
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

      {/* Hero: exact mockup viewport with central rescuer illustration on sage background */}
      <section
        className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center overflow-hidden py-8 sm:py-10 px-4 sm:px-8 lg:px-12 xl:px-16"
        style={{
          background: "linear-gradient(135deg, #B5D8D1 0%, #A6CCC6 50%, #9BC3BC 100%)",
        }}
        aria-label="Message composer"
      >
        {/* Center Illustration: The carved wood head, rescuer, and mind */}
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <div className="relative w-full h-full max-w-[1480px]">
            <Image
              src="/hero.png"
              alt="A carved wooden head split open, with a rescuer climbing down to support someone in distress"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        </div>

        {/* Content container: Left hero typography & Right floating dark composer card */}
        <div className="relative z-10 w-full max-w-[84rem] mx-auto flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-12 xl:gap-16">
          {/* LEFT: Hero typography & trust badges */}
          <div className="w-full lg:max-w-[420px] xl:max-w-[460px] shrink-0 text-left pt-2 lg:pt-0">
            {/* Pill: MENTAL HEALTH SUPPORT */}
            <span
              className="inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#243B38] mb-4 backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.45)",
                border: "1px solid rgba(130, 175, 168, 0.6)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              Mental health support
            </span>

            {/* Big Serif Heading */}
            <h1 className="display text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-bold leading-[1.05] tracking-tight text-[#111827]">
              We get you,<br />
              we got you.
            </h1>

            {/* Subtitle */}
            <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#2C4441] max-w-sm font-normal">
              You don&apos;t need a name. You don&apos;t need an account, a professional will be there.
            </p>

            {/* Trust Badges matching mockup */}
            <div className="mt-8 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white shadow-sm"
                  style={{
                    background: "rgba(24, 35, 41, 0.94)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-300" />
                  Anonymous
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white shadow-sm"
                  style={{
                    background: "rgba(24, 35, 41, 0.94)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <UsersGroupIcon className="h-3.5 w-3.5 text-slate-300" />
                  Professionals
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white shadow-sm"
                  style={{
                    background: "rgba(24, 35, 41, 0.94)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <GlobeNetworkIcon className="h-3.5 w-3.5 text-slate-300" />
                  Any Language
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white shadow-sm"
                  style={{
                    background: "rgba(24, 35, 41, 0.94)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <GlobeNetworkIcon className="h-3.5 w-3.5 text-slate-300" />
                  Any Language
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Floating Dark Glass Composer Card */}
          <div
            className="w-full max-w-[460px] xl:max-w-[490px] rounded-[28px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.45)] transition-all shrink-0 my-4 lg:my-0"
            style={{
              background: "rgba(11, 21, 25, 0.94)",
              border: "1px solid rgba(78, 216, 189, 0.35)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Active conversation pill if any */}
            {activeCode && (
              <div
                className="mb-4 rounded-xl p-3 transition-all"
                style={{
                  background: "rgba(34, 153, 130, 0.15)",
                  border: "1px solid rgba(78, 216, 189, 0.35)",
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
                    <p className="mt-0.5 text-xs font-mono" style={{ color: "rgba(241,245,249,0.9)" }}>
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
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-2">
                  <Link
                    href={`/thread/${encodeURIComponent(activeCode)}`}
                    className="btn-press inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold no-underline transition-all"
                    style={{
                      background: "#229982",
                      color: "#090D15",
                    }}
                  >
                    Open your conversation &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Composer Header */}
            <div>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#4ED8BD]">
                {t("eyebrow")}
              </p>
              <h2 className="display mt-0.5 text-2xl sm:text-[28px] font-bold text-white tracking-tight">
                {t("heroPrompt")}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                {t("heroSubtitle")}
              </p>
            </div>

            {crisisSelected && (
              <div className="mt-3">
                <CrisisCard />
              </div>
            )}

            {/* Category pills */}
            <p className="mt-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {t("chooseCategory")}
            </p>
            <div
              className="mt-2 flex flex-wrap gap-1.5 sm:gap-2"
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
                    className="btn-press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[34px] cursor-pointer text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
                    style={
                      isSel
                        ? {
                            background: "rgba(34,153,130,0.28)",
                            border: "1px solid rgba(78,216,189,0.65)",
                            color: "#FFFFFF",
                            boxShadow: "0 0 14px rgba(34,153,130,0.35)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(241,245,249,0.85)",
                          }
                    }
                  >
                    <span
                      style={{
                        color: isSel ? "#4ED8BD" : c.crisis ? "#F87171" : "rgba(203,213,225,0.8)",
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
            <div
              className="mt-3.5 relative rounded-2xl border transition-all focus-within:border-[rgba(78,216,189,0.6)] focus-within:ring-1 focus-within:ring-[rgba(78,216,189,0.25)]"
              style={{
                background: "rgba(7, 13, 16, 0.85)",
                borderColor: "rgba(255, 255, 255, 0.12)",
              }}
            >
              <textarea
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
                maxLength={10000}
                rows={3}
                placeholder={t("placeholder")}
                className="w-full bg-transparent px-3.5 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans"
              />
              <div className="flex justify-end px-3 pb-2">
                <span className="text-[11px] text-slate-500 font-mono tabular-nums select-none">
                  {content.length} / 10000
                </span>
              </div>
            </div>

            {/* Reply language selection pills */}
            <div className="mt-3.5 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-300">
                {t("replyLanguage")}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { code: "en", label: "English", isUs: true },
                  { code: "am", label: "Amharic", isUs: false },
                  { code: "om", label: "Oromo", isUs: false },
                  { code: "ti", label: "Tigrinya", isUs: false },
                ].map((lang) => {
                  const isLangSel = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      aria-pressed={isLangSel}
                      onClick={() => setLanguage(lang.code)}
                      className="btn-press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[34px] cursor-pointer text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
                      style={
                        isLangSel
                          ? {
                              background: "rgba(34,153,130,0.25)",
                              border: "1px solid rgba(78,216,189,0.6)",
                              color: "#4ED8BD",
                              boxShadow: "0 0 10px rgba(34,153,130,0.25)",
                            }
                          : {
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(226,232,240,0.8)",
                            }
                      }
                    >
                      {lang.isUs ? (
                        <UsFlagIcon className="h-3 w-4" />
                      ) : (
                        <EtFlagIcon className="h-3 w-4" />
                      )}
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alerts */}
            {rateLimited && (
              <p role="alert" className="mt-2 text-sm" style={{ color: "#D96B58" }}>
                {tCommon("rateLimited")}
              </p>
            )}
            {error && (
              <p role="alert" className="mt-2 text-sm" style={{ color: "#D96B58" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !content.trim() || !selected}
              className="btn-press mt-4 w-full rounded-full py-3.5 px-6 font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0E262C 0%, #133942 100%)",
                border: "1px solid rgba(78, 216, 189, 0.55)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span>{submitting ? t("sending") : t("send")}</span>
              <span className="text-base leading-none">&rarr;</span>
            </button>

            <p className="mt-2.5 text-center text-[11px] text-slate-400">
              {t("privacyLine")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

