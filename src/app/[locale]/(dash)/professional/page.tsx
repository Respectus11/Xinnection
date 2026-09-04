import { getTranslations } from "next-intl/server";
import { categoryKey } from "@/components/categories";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { formatAgo } from "@/lib/time";
import { routing } from "@/i18n/routing";
import { ClaimButton } from "./ClaimButton";
import { QueueFilters } from "./QueueFilters";

export const dynamic = "force-dynamic";

// Queue view: data-dense rows separated by hairlines, crisis-flagged items
// always sorted to the top regardless of filters.
export default async function ProfessionalQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; language?: string }>;
}) {
  const { category, language } = await searchParams;
  const t = await getTranslations("queue");
  const tCats = await getTranslations("categories");
  const tLang = await getTranslations("languages");

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const threads = await prisma.thread.findMany({
    where: {
      status: "OPEN",
      claimedById: null,
      ...(category ? { category: { slug: category } } : {}),
      ...(language ? { language } : {}),
    },
    include: {
      category: true,
      crisisFlags: { where: { resolvedAt: null } },
      _count: { select: { messages: true } },
    },
  });
  threads.sort((a, b) => {
    const aFlagged = a.crisisFlags.length > 0 ? 0 : 1;
    const bFlagged = b.crisisFlags.length > 0 ? 0 : 1;
    if (aFlagged !== bFlagged) return aFlagged - bFlagged;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <QueueFilters
        categories={categories.map((c) => ({ slug: c.slug, label: tCats(categoryKey(c.slug)) }))}
        languages={routing.locales.map((code) => ({ code, label: tLang(code) }))}
        selectedCategory={category ?? ""}
        selectedLanguage={language ?? ""}
      />
      {threads.length === 0 ? (
        <p className="mt-8 text-ink/70">{t("empty")}</p>
      ) : (
        <ul className="mt-6 border-t border-line">
          {threads.map((thread) => {
            const flagged = thread.crisisFlags.length > 0;
            return (
              <li
                key={thread.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-3"
              >
                <span
                  role={flagged ? "img" : undefined}
                  aria-label={flagged ? t("flagged") : undefined}
                  className={`h-2.5 w-2.5 rounded-full ${flagged ? "bg-flag" : "bg-line"}`}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={flagged ? "flag" : "neutral"}>
                      {tCats(categoryKey(thread.category.slug))}
                    </Badge>
                    <span className="text-sm text-ink/60">{tLang(thread.language)}</span>
                    <span className="text-sm text-ink/60">
                      {thread._count.messages} {t("messages")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink/50">
                    {t("waiting")} {formatAgo(thread.createdAt)}
                  </p>
                </div>
                <ClaimButton threadId={thread.id} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
