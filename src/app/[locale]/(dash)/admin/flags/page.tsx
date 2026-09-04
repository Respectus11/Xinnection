import { getTranslations } from "next-intl/server";
import { categoryKey } from "@/components/categories";
import { STATUS_KEYS } from "@/components/status";
import { Badge } from "@/components/ui/Badge";
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
// regardless of who claimed them, sorted by time since flagged.
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
      <h1 className="text-2xl font-semibold">{t("flagsTitle")}</h1>
      {flags.length === 0 ? (
        <p className="mt-8 text-ink/70">{t("flagsEmpty")}</p>
      ) : (
        <table className="mt-6 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/30">
              <th className="py-2 pr-4 font-medium">{t("category")}</th>
              <th className="py-2 pr-4 font-medium">{t("threadCreated")}</th>
              <th className="py-2 pr-4 font-medium">{t("flagRaised")}</th>
              <th className="py-2 pr-4 font-medium">{tLabels("source")}</th>
              <th className="py-2 pr-4 font-medium">{tLabels("status")}</th>
              <th className="py-2 pr-4 font-medium">{tLabels("professional")}</th>
              <th className="py-2 font-medium">{tLabels("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-line align-top">
                <td className="py-2 pr-4">
                  <Badge tone="flag">{tCats(categoryKey(flag.thread.category.slug))}</Badge>
                </td>
                <td className="py-2 pr-4 text-ink/60">{formatAgo(flag.thread.createdAt)}</td>
                <td className="py-2 pr-4 text-ink/60">{formatAgo(flag.raisedAt)}</td>
                <td className="py-2 pr-4">{tSource(SOURCE_KEYS[flag.source])}</td>
                <td className="py-2 pr-4">{tStatus(STATUS_KEYS[flag.thread.status])}</td>
                <td className="py-2 pr-4">
                  {flag.thread.claimedBy?.fullName ?? t("unassigned")}
                </td>
                <td className="py-2">
                  <ResolveFlagButton flagId={flag.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
