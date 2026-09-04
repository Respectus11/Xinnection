import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { formatDateTimeUtc } from "@/lib/time";

export const dynamic = "force-dynamic";

const ACTIONS = [
  "thread.claim",
  "thread.status",
  "thread.flag",
  "professional.approve",
  "professional.reject",
  "professional.suspend",
  "professional.reinstate",
  "flag.resolve",
] as const;

// Read-only, filterable audit log. Every admin mutation lands here via the
// shared audit utility — never message content, only actor, action, target
// and non-sensitive metadata such as suspension reasons.
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; actor?: string; from?: string; to?: string }>;
}) {
  const { action, actor, from, to } = await searchParams;
  const t = await getTranslations("admin");
  // Action labels live in their own top-level namespace.
  const tActions = await getTranslations("auditActions");

  const entries = await prisma.auditLogEntry.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(actor ? { actorId: { contains: actor } } : {}),
      ...(from || to
        ? {
            createdAt: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const inputClasses =
    "rounded border border-line bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">{t("auditTitle")}</h1>
      <form className="mt-4 flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1">
          <span className="text-ink/60">{t("filterAction")}</span>
          <select name="action" defaultValue={action ?? ""} className={inputClasses}>
            <option value=""></option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {tActions(a)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink/60">{t("filterActor")}</span>
          <input name="actor" defaultValue={actor ?? ""} className={inputClasses} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink/60">{t("filterFrom")}</span>
          <input type="date" name="from" defaultValue={from ?? ""} className={inputClasses} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink/60">{t("filterTo")}</span>
          <input type="date" name="to" defaultValue={to ?? ""} className={inputClasses} />
        </label>
        <button
          type="submit"
          className="rounded border border-ink/30 px-4 py-2 text-sm font-medium hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {t("apply")}
        </button>
        {action || actor || from || to ? (
          <a href="?" className="text-sm underline underline-offset-4">
            {t("clear")}
          </a>
        ) : null}
      </form>
      {entries.length === 0 ? (
        <p className="mt-8 text-ink/70">{t("auditEmpty")}</p>
      ) : (
        <table className="mt-6 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/30">
              <th className="py-2 pr-4 font-medium">{t("when")}</th>
              <th className="py-2 pr-4 font-medium">{t("actor")}</th>
              <th className="py-2 pr-4 font-medium">{t("action")}</th>
              <th className="py-2 pr-4 font-medium">{t("target")}</th>
              <th className="py-2 font-medium">{t("notes")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const meta = (entry.metadata ?? null) as { reason?: string } | null;
              return (
                <tr key={entry.id} className="border-b border-line align-top">
                  <td className="whitespace-nowrap py-2 pr-4">{formatDateTimeUtc(entry.createdAt)}</td>
                  <td className="py-2 pr-4">
                    {entry.actorType} <span className="text-ink/40">{entry.actorId.slice(-6)}</span>
                  </td>
                  <td className="py-2 pr-4">{tActions(entry.action)}</td>
                  <td className="py-2 pr-4 text-ink/60">
                    {entry.targetType} <span className="text-ink/40">{entry.targetId.slice(-6)}</span>
                  </td>
                  <td className="py-2 text-ink/60">{meta?.reason ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
