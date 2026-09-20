"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

const ACTIVE_CODE_KEY = "xinnection_active_code";

export function ThreadLookupForm({ notFound = false }: { notFound?: boolean }) {
  const t = useTranslations("lookup");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [savedCode, setSavedCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_CODE_KEY);
      if (stored && stored.trim()) {
        const clean = stored.trim();
        setSavedCode(clean);
        setCode(clean);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return (
    <section className="card mx-auto mt-6 max-w-md p-6 sm:p-8">
      <span style={{ color: "#4ED8BD" }}>
        <HighlandsMark variant="mark" className="h-6 w-auto" />
      </span>
      <h1 className="display mt-3 text-2xl font-bold" style={{ color: "#F1F5F9" }}>
        {t("title")}
      </h1>
      {notFound && (
        <p role="alert" className="mt-3 text-sm font-medium" style={{ color: "#F87171" }}>
          {t("notFound")}
        </p>
      )}

      {savedCode && !notFound && (
        <div
          className="mt-4 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3"
          style={{
            background: "rgba(34, 153, 130, 0.14)",
            border: "1px solid rgba(78, 216, 189, 0.35)",
          }}
        >
          <div>
            <p className="font-semibold uppercase tracking-wider text-[11px]" style={{ color: "#4ED8BD" }}>
              Detected active code on this device
            </p>
            <p className="mt-1 font-mono text-sm font-semibold" style={{ color: "#F1F5F9" }}>
              {savedCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCode(savedCode)}
            className="btn-press px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            style={{
              background: "rgba(78,216,189,0.2)",
              color: "#4ED8BD",
              border: "1px solid rgba(78,216,189,0.4)",
            }}
          >
            Use Code
          </button>
        </div>
      )}

      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = code.trim();
          if (trimmed) {
            try {
              window.localStorage.setItem(ACTIVE_CODE_KEY, trimmed);
            } catch {
              // Ignore
            }
            router.push(`/thread/${encodeURIComponent(trimmed)}`);
          }
        }}
      >
        <Label htmlFor="code">{t("label")}</Label>
        <Input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t("placeholder")}
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" variant="primary" className="mt-4 w-full" disabled={!code.trim()}>
          {t("action")}
        </Button>
      </form>
    </section>
  );
}
