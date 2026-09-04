import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { DashboardSidebar } from "@/components/dash/DashboardSidebar";
import { getSession } from "@/lib/auth";

// RBAC at the layout layer (API routes enforce it independently): only
// ADMIN / SUPER_ADMIN roles may enter the admin module. The high-risk
// oversight view is reachable from here in one click — never buried.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    redirect({ href: "/admin/login", locale });
  }

  const t = await getTranslations("nav");
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        items={[
          { href: "/admin", label: t("overview") },
          { href: "/admin/onboarding", label: t("onboarding") },
          { href: "/admin/professionals", label: t("professionals") },
          { href: "/admin/flags", label: t("flags") },
          { href: "/admin/audit", label: t("audit") },
        ]}
      />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
