import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fraunces, notoEthiopic, notoSans } from "../fonts";
import "../globals.css";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: `${t("appName")}: ${t("tagline")}`,
    description: t("tagline"),
  };
}

export const viewport: Viewport = {
  themeColor: "#090D15",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const script = locale === "en" ? "latin" : "ethiopic";

  return (
    <html
      lang={locale}
      data-script={script}
      className={`${notoSans.variable} ${notoEthiopic.variable} ${fraunces.variable}`}
    >
      <body className="font-sans text-ink antialiased" style={{ background: "#081524" }}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
