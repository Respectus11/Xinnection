import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryKey } from "@/components/categories";
import { STATUS_KEYS } from "@/components/status";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusPill";
import { ThreadLine } from "@/components/ui/ThreadLine";
import { BackIcon } from "@/components/ui/icons";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptMessages } from "@/lib/threads";
import { formatAgo } from "@/lib/time";
import { CaseClient } from "./CaseClient";

export const dynamic = "force-dynamic";

// Case view: the same ThreadLine as the seeker side — it is the same
// conversation from the other end, sitting in the same elevated card. Higher
// information density on purpose: this is a working tool, not a calm entry.
export default async function CasePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      category: true,
      crisisFlags: { where: { resolvedAt: null } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();

  const t = await getTranslations("case");
  const tQueue = await getTranslations("queue");
  const tThread = await getTranslations("thread");
  const tStatus = await getTranslations("status");
  const tCats = await getTranslations("categories");
  const tLang = await getTranslations("languages");

  const turns = decryptMessages(thread.wrappedDek, thread.messages).map((turn) => ({
    id: turn.id,
    role: turn.role,
    text: turn.text,
    at: formatAgo(turn.createdAt),
  }));

  const flagged = thread.crisisFlags.length > 0;
  const mine = thread.claimedById === session.sub;

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/professional"
        className="btn-press inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
      >
        <BackIcon className="h-4 w-4" />
        {t("backToQueue")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Badge tone="neutral">{tCats(categoryKey(thread.category.slug))}</Badge>
        <span className="text-sm font-medium text-slate-300">{tLang(thread.language)}</span>
        <StatusPill status={thread.status} label={tStatus(STATUS_KEYS[thread.status])} />
        {flagged && <Badge tone="flag">{tQueue("flagged")}</Badge>}
        <span className="tnum text-sm text-slate-300">
          {tQueue("waiting")} {formatAgo(thread.createdAt)}
        </span>
      </div>

      {!mine && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-[rgba(217,107,88,0.35)] bg-[rgba(217,107,88,0.12)] px-4 py-3 text-sm font-medium text-[#F87171]"
        >
          {t("notYours")}
        </p>
      )}

      <div className="card mt-6 p-6 sm:p-8">
        <ThreadLine
          turns={turns}
          labels={{ seeker: tThread("you"), professional: tThread("professional") }}
        />
      </div>

      {mine && <CaseClient threadId={thread.id} status={thread.status} flagged={flagged} />}
    </section>
  );
}
