"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

// Category options are loaded server-side and passed in pre-translated.
export function QueueFilters({
  categories,
  languages,
  selectedCategory,
  selectedLanguage,
}: {
  categories: { slug: string; label: string }[];
  languages: { code: string; label: string }[];
  selectedCategory: string;
  selectedLanguage: string;
}) {
  const t = useTranslations("queue");
  const router = useRouter();
  const pathname = usePathname();

  function update(next: { category?: string; language?: string }) {
    const cat = next.category ?? selectedCategory;
    const lang = next.language ?? selectedLanguage;
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (lang) params.set("language", lang);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const selectClasses =
    "border border-line bg-white px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {categories.length > 0 && (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink/60">{t("filterCategory")}</span>
          <select
            value={selectedCategory}
            onChange={(event) => update({ category: event.target.value })}
            className={selectClasses}
          >
            <option value="">{t("all")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <span className="text-ink/60">{t("filterLanguage")}</span>
        <select
          value={selectedLanguage}
          onChange={(event) => update({ language: event.target.value })}
          className={selectClasses}
        >
          <option value="">{t("all")}</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
