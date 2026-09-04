import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryKey } from "@/components/categories";
import { STATUS_KEYS } from "@/components/status";
import { Badge } from "@/components/ui/Badge";
import { ThreadLine } from "@/components/ui/ThreadLine";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptMessages } from "@/lib/threads";
import { formatAgo } from "@/lib/time";
import { CaseClient } from "./CaseClient";

export const dynamic = "force-dynamic";

// Case view: the same ThreadLine as the seeker side — it is the same
// conversation, just from the other end. Information density is higher here
// on purpose: this is a working tool, not a calm entry point.
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
      <Link href="/professional" className="text-sm underline underline-offset-4">
        {t("backToQueue")}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{tCats(categoryKey(thread.category.slug))}</Badge>
        <span className="text-sm text-ink/60">{tLang(thread.language)}</span>
        <Badge
          tone={thread.status === "RESOLVED" ? "eucalyptus" : thread.status === "ESCALATED" ? "flag" : "neutral"}
        >
          {tStatus(STATUS_KEYS[thread.status])}
        </Badge>
        <span className="text-sm text-ink/50">
          {tQueue("waiting")} {formatAgo(thread.createdAt)}
        </span>
      </div>
      {flagged && (
        <p className="mt-3">
          <Badge tone="flag">{tQueue("flagged")}</Badge>
        </p>
      )}
      {!mine && (
        <p role="alert" className="mt-4 text-flag">
          {t("notYours")}
        </p>
      )}
      <div className="mt-6">
        <ThreadLine
          turns={turns}
          labels={{ seeker: tThread("you"), professional: tThread("professional") }}
        />
      </div>
      {mine && <CaseClient threadId={thread.id} status={thread.status} flagged={flagged} />}
    </section>
  );
}
