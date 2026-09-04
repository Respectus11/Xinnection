import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardSidebar } from "@/components/dash/DashboardSidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// RBAC at the layout layer (API routes enforce it independently): only the
// Professional role may enter the professional workspace. Caseload count is
// kept deliberately simple — no analytics yet.
export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "PROFESSIONAL") {
    // Locale is restored by the middleware from the NEXT_LOCALE cookie.
    redirect("/professional/login");
  }

  const [t, caseload] = await Promise.all([
    getTranslations("nav"),
    prisma.thread.count({
      where: { claimedById: session.sub, status: { in: ["IN_PROGRESS", "ESCALATED"] } },
    }),
  ]);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar items={[{ href: "/professional", label: t("queue") }]} caseload={caseload} />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
