"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { UsFlagIcon, EtFlagIcon } from "@/components/ui/icons";

/**
 * Language selection dropdown supporting international and Horn of Africa languages:
 * - English (US) [en]
 * - Amharic / አማርኛ [am]
 * - Afaan Oromoo [om]
 * - Tigrinya / ትግርኛ [ti]
 *
 * Implements accessible WAI-ARIA combobox/listbox pattern with:
 * - Keyboard navigation (Esc to dismiss)
 * - Outside-click dismissal
 * - Smooth next-intl client-side URL routing transitions
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (US)", nativeName: "English (US)", region: "Global" },
  { code: "am", label: "Amharic", nativeName: "አማርኛ", region: "Ethiopia" },
  { code: "om", label: "Afaan Oromoo", nativeName: "Oromoo", region: "Horn of Africa" },
  { code: "ti", label: "Tigrinya", nativeName: "ትግርኛ", region: "Eritrea / Ethiopia" },
] as const;

/**
 * Renders localized national flag icon according to language code.
 */
function LanguageFlag({ code }: { code: string }) {
  if (code === "en") {
    return <UsFlagIcon className="h-3.5 w-4" />;
  }
  return <EtFlagIcon className="h-3.5 w-4" />;
}

export interface LanguageDropdownProps {
  /** Visual presentation mode: top header or composer overlay */
  variant?: "header" | "composer";
  /** Optional override handler when used as a local state picker */
  onSelectLanguage?: (code: string) => void;
  /** Currently selected language code if driven externally */
  selectedLanguage?: string;
}

/**
 * Dropdown component enabling instantaneous locale switching across all application routes.
 */
export function LanguageDropdown({
  variant = "header",
  onSelectLanguage,
  selectedLanguage,
}: LanguageDropdownProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCode = selectedLanguage ?? currentLocale;
  const activeLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === activeCode) ??
    SUPPORTED_LANGUAGES[0];

  // Close on escape key and outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(code: string) {
    setIsOpen(false);
    if (onSelectLanguage) {
      onSelectLanguage(code);
      return;
    }
    // Switch the locale in the URL
    startTransition(() => {
      router.replace(pathname, { locale: code as "en" | "am" | "om" | "ti" });
    });
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        id="language-dropdown-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className={`group btn-press flex items-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer min-h-[38px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED8BD] ${
          variant === "header"
            ? "px-3.5 py-1.5 text-xs bg-[rgba(24,35,41,0.92)] hover:bg-[rgba(24,35,41,1)] border border-[rgba(255,255,255,0.12)] text-[#FFFFFF] shadow-sm"
            : "px-3 py-2 text-xs bg-[rgba(14,22,36,0.8)] hover:bg-[rgba(14,22,36,0.95)] border border-[rgba(255,255,255,0.12)] text-[#F1F5F9]"
        }`}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <LanguageFlag code={activeLang.code} />
        <span className="font-sans font-medium tracking-tight">
          {activeLang.nativeName}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="language-dropdown-button"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl p-1.5 shadow-2xl z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: "rgba(14,22,36,0.96)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(78,216,189,0.15)",
          }}
        >
          <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4ED8BD]">
              Select Language / ቋንቋ
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Available internationally
            </p>
          </div>

          <div className="py-1 flex flex-col gap-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === activeCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] cursor-pointer text-left rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                    isSelected
                      ? "bg-[rgba(34,153,130,0.22)] text-[#F1F5F9] font-medium border border-[rgba(78,216,189,0.35)]"
                      : "text-slate-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LanguageFlag code={lang.code} />
                    <div className="flex flex-col">
                      <span className="font-medium text-[13px]">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-300">{lang.label} &bull; {lang.region}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-2 w-2 rounded-full bg-[#4ED8BD] shadow-[0_0_8px_#4ED8BD]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
