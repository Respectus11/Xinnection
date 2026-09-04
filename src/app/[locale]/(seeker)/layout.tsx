import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// SeekerLayout: centered, narrow column with generous whitespace and minimal
// chrome — the opposite of a busy dashboard, because the visitor may be in
// distress.
export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[640px] items-center justify-between px-4 py-3">
          <Link href="/" className="text-base font-semibold tracking-tight text-ink no-underline">
            {t("appName")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-[640px] px-4 pb-24 pt-10">{children}</main>
    </div>
  );
}
