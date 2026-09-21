import { getTranslations } from "next-intl/server";
import { categoryKey } from "@/components/categories";
import { config } from "@/lib/config";
import { prisma } from "@/lib/db";
import { formatAgo } from "@/lib/time";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamic = "force-dynamic";

// Admin overview: four compact stat blocks divided by hairlines — clear
// numbers set in the display serif, no decorative gradient treatment, no
// percentage badges. The unclaimed-thread aging alert is the safety net for
// seekers waiting too long; it uses the shared dignified crisis register.
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
    { label: t("openCases"), value: openCases, alert: false },
    { label: t("unclaimed"), value: unclaimed, alert: false },
    { label: t("activeFlags"), value: activeFlags, alert: activeFlags > 0 },
    { label: t("pendingPros"), value: pendingPros, alert: false },
  ];

  return (
    <section className="mx-auto max-w-5xl">
      <SectionHeading title={tNav("overview")} />

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card p-5"
            style={{
              background: "rgba(14, 21, 35, 0.76)",
              border: stat.alert
                ? "1px solid rgba(217, 107, 88, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(226, 232, 240, 0.88)" }}>
              {stat.label}
            </dt>
            <dd
              className={`display mt-2 text-3xl font-bold tnum`}
              style={{ color: stat.alert ? "#F87171" : "#F1F5F9" }}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {aging.length > 0 && (
        <div role="alert" className="crisis-card mt-8 p-5">
          <p className="display text-lg font-bold text-[#F87171]">{t("agingTitle")}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{t("agingBody")}</p>
          <ul className="mt-3 space-y-2">
            {aging.map((thread) => (
              <li key={thread.id} className="text-sm">
                <span className="font-semibold text-[#F1F5F9]">{tCats(categoryKey(thread.category.slug))}</span>
                <span className="tnum text-slate-300 font-medium"> — {formatAgo(thread.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
