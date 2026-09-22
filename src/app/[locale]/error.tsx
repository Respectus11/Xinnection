"use client";

import { useTranslations } from "next-intl";

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
    console.error(`[ui] error digest: ${error.digest}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100">
        <h1 className="mt-4 text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-slate-400 leading-relaxed">{t("body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
            onClick={reset}
          >
            {t("retry")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            onClick={() => window.location.assign("/")}
          >
            {tCommon("goHome")}
          </button>
        </div>
      </div>
    </main>
  );
}
