import { getTranslations } from "next-intl/server";
import { categoryKey } from "@/components/categories";
import { STATUS_KEYS } from "@/components/status";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/db";
import { formatAgo } from "@/lib/time";
import { ResolveFlagButton } from "./ResolveFlagButton";

export const dynamic = "force-dynamic";

const SOURCE_KEYS: Record<string, string> = {
  SEEKER_SELECTION: "seekerSelection",
  KEYWORD_SCREEN: "keywordScreen",
  PROFESSIONAL: "professional",
};

// The safety net view: ALL currently flagged crisis cases platform-wide,
// regardless of who claimed them, oldest flag first. Reachable in one click
// from the sidebar — never buried in a submenu.
export default async function FlagsPage() {
  const t = await getTranslations("admin");
  const tLabels = await getTranslations("labels");
  const tSource = await getTranslations("source");
  const tStatus = await getTranslations("status");
  const tCats = await getTranslations("categories");

  const flags = await prisma.crisisFlag.findMany({
    where: { resolvedAt: null },
    include: {
      thread: { include: { category: true, claimedBy: { select: { fullName: true } } } },
    },
    orderBy: { raisedAt: "asc" },
  });

  return (
    <section className="mx-auto max-w-5xl">
      <SectionHeading title={t("flagsTitle")} />
      {flags.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("flagsEmpty")} />
        </div>
      ) : (
        <div className="mt-7 overflow-x-auto">
          <table className="hairline-table">
            <thead>
              <tr>
                <th>{t("category")}</th>
                <th>{t("threadCreated")}</th>
                <th>{t("flagRaised")}</th>
                <th>{tLabels("source")}</th>
                <th>{tLabels("status")}</th>
                <th>{tLabels("professional")}</th>
                <th>{tLabels("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id}>
                  <td>
                    <Badge tone="flag">{tCats(categoryKey(flag.thread.category.slug))}</Badge>
                  </td>
                  <td className="tnum text-ink/60">{formatAgo(flag.thread.createdAt)}</td>
                  <td className="tnum text-ink/60">{formatAgo(flag.raisedAt)}</td>
                  <td>{tSource(SOURCE_KEYS[flag.source])}</td>
                  <td>{tStatus(STATUS_KEYS[flag.thread.status])}</td>
                  <td>{flag.thread.claimedBy?.fullName ?? t("unassigned")}</td>
                  <td>
                    <ResolveFlagButton flagId={flag.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
