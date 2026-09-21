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
    if (href === "/admin" || href === "/professional") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 bg-dusk text-mist md:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href={home} className="flex items-center gap-2.5 no-underline">
            <HighlandsMark variant="mark" className="h-6 w-6" />
            <span className="display text-sm">{tCommon("appName")}</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="btn-press cursor-pointer px-3 py-2 min-h-[44px] text-xs font-semibold text-slate-200 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED8BD]"
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
                className={`whitespace-nowrap rounded-full px-4 py-2.5 min-h-[44px] flex items-center text-sm font-medium no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED8BD] ${
                  active ? "bg-white/10 text-white font-semibold" : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
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
        <div className="flex items-center gap-3 px-5 pt-6">
          <HighlandsMark variant="mark" className="h-8 w-8" />
          <p className="display text-base font-bold text-white">{tCommon("appName")}</p>
        </div>
        <ul className="mt-7 flex-1 px-3 space-y-1">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center min-h-[44px] rounded-xl px-3.5 py-2 text-sm no-underline transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED8BD] ${
                    active
                      ? "bg-[#229982]/20 text-[#4ED8BD] border border-[#4ED8BD]/35 font-semibold shadow-[0_0_12px_rgba(34,153,130,0.15)]"
                      : "border border-transparent text-slate-300 font-medium hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {typeof caseload === "number" && (
          <div className="mx-5 mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
            <p className="text-xs font-medium text-slate-400">{t("caseload")}</p>
            <p className="tnum mt-0.5 text-2xl font-bold text-white">{caseload}</p>
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          className="btn-press cursor-pointer mx-5 mb-6 rounded-xl border border-white/15 px-3 py-2.5 min-h-[44px] text-sm font-semibold text-slate-200 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED8BD]"
        >
          {t("signOut")}
        </button>
      </nav>
    </>
  );
}
