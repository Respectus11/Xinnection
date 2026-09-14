"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/fields";

// Category options are loaded server-side and passed in pre-translated.
// The bar is sticky so filters stay reachable while scrolling a long queue.
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

  return (
    <div className="sticky top-0 z-20 -mx-1 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-mist/90 px-1 py-3 backdrop-blur-sm">
      {categories.length > 0 && (
        <label className="flex items-center gap-2.5 text-sm">
          <span className="text-ink/60">{t("filterCategory")}</span>
          <Select
            value={selectedCategory}
            onChange={(event) => update({ category: event.target.value })}
            className="w-auto"
          >
            <option value="">{t("all")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="flex items-center gap-2.5 text-sm">
        <span className="text-ink/60">{t("filterLanguage")}</span>
        <Select
          value={selectedLanguage}
          onChange={(event) => update({ language: event.target.value })}
          className="w-auto"
        >
          <option value="">{t("all")}</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
