import { defineRouting } from "next-intl/routing";

export const locales = ["en", "am", "om", "ti"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Always show the locale prefix so links are explicit and shareable.
  localePrefix: "always",
});
