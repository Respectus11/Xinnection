"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const tLang = useTranslations("languages");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(event) => {
        router.replace(pathname, { locale: event.target.value as Locale });
      }}
      className="border border-line bg-mist px-2 py-1 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {tLang(l)}
        </option>
      ))}
    </select>
  );
}
