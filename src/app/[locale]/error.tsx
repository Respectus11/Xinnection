"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { HighlandsMark } from "@/components/ui/HighlandsMark";

// Register-consistent crash state. Shows for errors thrown below the
// [locale] layout; the root layout itself crashing falls through to
// global-error.tsx. No error details are rendered — the server log and
// (future) error tracker are the place for that.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  if (error.digest) {
    // Content-free correlation id only — safe to log, useful in ops.
    console.error(`[ui] error digest: ${error.digest}`);
  }

  return (
    <main className="atmosphere flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <HighlandsMark variant="mark" className="mx-auto h-8 w-auto text-eucalyptus" />
        <h1 className="display mt-4 text-2xl text-ink">{t("title")}</h1>
        <p className="mt-2 leading-relaxed text-ink/75">{t("body")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={reset}>
            {t("retry")}
          </Button>
          <Button variant="ghost" onClick={() => window.location.assign("/")}>
            {tCommon("goHome")}
          </Button>
        </div>
      </div>
    </main>
  );
}
