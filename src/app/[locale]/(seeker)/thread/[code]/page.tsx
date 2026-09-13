import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CrisisCard } from "@/components/ui/CrisisCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThreadLine } from "@/components/ui/ThreadLine";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { formatAgo } from "@/lib/time";
import { decryptMessages, getThreadByCode, listMessages, touchSession } from "@/lib/threads";
import { ThreadLookupForm } from "../ThreadLookupForm";
import { SeekerThreadClient } from "./SeekerThreadClient";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code: rawCode } = await params;
  setRequestLocale(locale);
  const code = decodeURIComponent(rawCode);

  const tThread = await getTranslations("thread");
  const tCommon = await getTranslations("common");

  // Rate-limit code lookups so the reply-check page cannot be used to
  // enumerate codes. Identity is a transiently hashed IP — never stored.
  const requestHeaders = await headers();
  const lookupLimit = await rateLimit("code-lookup", clientIpFromHeaders(requestHeaders), 30, 3600);
  if (!lookupLimit.ok) {
    return (
      <div>
        <p role="alert" className="text-flag">
          {tCommon("rateLimited")}
        </p>
        <div className="mt-6">
          <ThreadLookupForm />
        </div>
      </div>
    );
  }

  const thread = await getThreadByCode(code);
  if (!thread) {
    return <ThreadLookupForm notFound />;
  }

  await touchSession(thread.session.id);

  const messages = await listMessages(thread.id);
  const turns = decryptMessages(thread.wrappedDek, messages).map((turn) => ({
    id: turn.id,
    role: turn.role,
    text: turn.text,
    at: formatAgo(turn.createdAt),
  }));

  // Seeker-visible crisis resources only for flags raised by the seeker's own
  // actions (category selection / keyword screen). A professional's flag is
  // an internal clinical signal and changes nothing the seeker sees.
  const seekerVisibleFlag = thread.crisisFlags.some((flag) => flag.source !== "PROFESSIONAL");

  return (
    <section>
      <h1 className="sr-only">{tThread("lookup")}</h1>
      {seekerVisibleFlag && (
        <div className="mb-8">
          <CrisisCard />
        </div>
      )}
      {turns.length === 0 ? (
        <EmptyState title={tThread("emptyState")} />
      ) : (
        <div className="card p-6 sm:p-8">
          <ThreadLine
            turns={turns}
            labels={{ seeker: tThread("you"), professional: tThread("professional") }}
          />
        </div>
      )}
      <SeekerThreadClient threadId={thread.id} code={code} />
    </section>
  );
}
