"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";

export type NavItem = { href: string; label: string };

export function DashboardSidebar({
  items,
  caseload,
  home,
}: {
  items: NavItem[];
  caseload?: number;
  home: string;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(`${home}/login`);
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 bg-dusk text-mist md:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href={home} className="flex items-center gap-2 no-underline">
            <HighlandsMark variant="mark" className="h-4 w-auto text-gold/80" />
            <span className="display text-sm">{tCommon("appName")}</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-mist/70 transition-colors duration-150 hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist"
          >
            {t("signOut")}
          </button>
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 py-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${
                  active ? "bg-white/10 text-mist" : "text-mist/65"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop rail */}
      <nav
        aria-label="Dashboard"
        className="atmosphere-dusk hidden h-screen shrink-0 flex-col bg-dusk text-mist md:sticky md:top-0 md:flex md:w-64"
      >
        <div className="flex items-center gap-2.5 px-5 pt-6">
          <HighlandsMark variant="mark" className="h-5 w-auto text-gold/80" />
          <p className="display text-base">{tCommon("appName")}</p>
        </div>
        <ul className="mt-7 flex-1 px-3">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block border-l-2 py-2 pl-3.5 pr-3 text-sm no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${
                    active
                      ? "border-gold bg-white/[0.06] text-mist"
                      : "border-transparent text-mist/65 hover:bg-white/[0.04] hover:text-mist"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {typeof caseload === "number" && (
          <div className="mx-5 mb-4 rounded-md border border-mist/15 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
            <p className="text-xs text-mist/55">{t("caseload")}</p>
            <p className="tnum mt-0.5 text-2xl font-semibold">{caseload}</p>
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          className="mx-5 mb-6 rounded-md border border-mist/25 px-3 py-2 text-sm text-mist/80 transition-colors duration-150 hover:border-mist/50 hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist"
        >
          {t("signOut")}
        </button>
      </nav>
    </>
  );
}
