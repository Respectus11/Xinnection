import { getTranslations } from "next-intl/server";
import { categoryKey } from "@/components/categories";
import { config } from "@/lib/config";
import { prisma } from "@/lib/db";
import { formatAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

// Admin overview: four compact stat blocks — clear numbers and labels, no
// decorative gradient treatment — plus the unclaimed-thread aging alert,
// which is the safety net for seekers waiting too long.
export default async function AdminOverviewPage() {
  const t = await getTranslations("admin");
  const tNav = await getTranslations("nav");
  const tCats = await getTranslations("categories");

  const [openCases, unclaimed, activeFlags, pendingPros, aging] = await Promise.all([
    prisma.thread.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } } }),
    prisma.thread.count({ where: { status: "OPEN", claimedById: null } }),
    prisma.crisisFlag.count({ where: { resolvedAt: null } }),
    prisma.professional.count({ where: { status: "PENDING" } }),
    prisma.thread.findMany({
      where: {
        status: "OPEN",
        claimedById: null,
        createdAt: { lt: new Date(Date.now() - config.unclaimedAlertHours * 3600 * 1000) },
      },
      include: { category: true },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: t("openCases"), value: openCases },
    { label: t("unclaimed"), value: unclaimed },
    { label: t("activeFlags"), value: activeFlags },
    { label: t("pendingPros"), value: pendingPros },
  ];

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">{tNav("overview")}</h1>
      <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-mist p-5">
            <dt className="text-sm text-ink/60">{stat.label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {aging.length > 0 && (
        <div role="alert" className="mt-8 border-l-4 border-flag bg-white p-4">
          <p className="font-semibold text-flag">{t("agingTitle")}</p>
          <p className="mt-1 text-sm text-ink/70">{t("agingBody")}</p>
          <ul className="mt-2 space-y-1">
            {aging.map((thread) => (
              <li key={thread.id} className="text-sm">
                <span className="font-medium">{tCats(categoryKey(thread.category.slug))}</span>
                <span className="text-ink/60"> — {formatAgo(thread.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
