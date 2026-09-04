"use client";

import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type NavItem = { href: string; label: string };

// DashboardLayout chrome: deep dusk sidebar over a mist content area — the
// deliberate visual shift that marks "this is the professional workspace".
export function DashboardSidebar({
  items,
  caseload,
}: {
  items: NavItem[];
  caseload?: number;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/professional/login");
    router.refresh();
  }

  return (
    <nav aria-label="Dashboard" className="flex h-full w-60 shrink-0 flex-col bg-dusk text-mist">
      <p className="px-5 pt-5 text-base font-semibold">{tCommon("appName")}</p>
      <ul className="mt-4 flex-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block border-l-2 px-5 py-2 text-sm no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${
                  active
                    ? "border-gold bg-white/5 text-mist"
                    : "border-transparent text-mist/70 hover:text-mist"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {typeof caseload === "number" && (
        <div className="mx-5 mb-4 border border-mist/20 p-3">
          <p className="text-xs text-mist/60">{t("caseload")}</p>
          <p className="text-lg font-semibold">{caseload}</p>
        </div>
      )}
      <button
        type="button"
        onClick={signOut}
        className="mx-5 mb-5 border border-mist/30 px-3 py-2 text-sm text-mist/80 transition-colors hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist"
      >
        {t("signOut")}
      </button>
    </nav>
  );
}
