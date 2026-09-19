import { defineRouting } from "next-intl/routing";

// Shipping English-first for an international audience; the plumbing keeps
// next-intl so additional locales bolt on later without UI rework (message
// files for am/om/ti remain in /messages for that day).
export const locales = ["en", "am", "om", "ti"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Always show the locale prefix so links are explicit and shareable.
  localePrefix: "always",
});
