import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input, Select } from "@/components/ui/fields";
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

  return (
    <section className="mx-auto max-w-5xl">
      <SectionHeading title={t("auditTitle")} />
      <form className="mt-5 flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/60">{t("filterAction")}</span>
          <Select name="action" defaultValue={action ?? ""} className="w-auto">
            <option value=""></option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {tActions(a)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/60">{t("filterActor")}</span>
          <Input name="actor" defaultValue={actor ?? ""} className="w-44 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/60">{t("filterFrom")}</span>
          <Input type="date" name="from" defaultValue={from ?? ""} className="w-auto py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/60">{t("filterTo")}</span>
          <Input type="date" name="to" defaultValue={to ?? ""} className="w-auto py-1.5 text-sm" />
        </label>
        <Button type="submit" variant="secondary">
          {t("apply")}
        </Button>
        {action || actor || from || to ? (
          <a
            href="?"
            className="pb-2 text-sm underline decoration-ink/30 underline-offset-4 transition-colors duration-150 hover:decoration-ink"
          >
            {t("clear")}
          </a>
        ) : null}
      </form>
      {entries.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("auditEmpty")} />
        </div>
      ) : (
        <div className="mt-7 overflow-x-auto">
          <table className="hairline-table">
            <thead>
              <tr>
                <th>{t("when")}</th>
                <th>{t("actor")}</th>
                <th>{t("action")}</th>
                <th>{t("target")}</th>
                <th>{t("notes")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const meta = (entry.metadata ?? null) as { reason?: string } | null;
                return (
                  <tr key={entry.id}>
                    <td className="tnum whitespace-nowrap">{formatDateTimeUtc(entry.createdAt)}</td>
                    <td>
                      {entry.actorType} <span className="text-ink/60">{entry.actorId.slice(-6)}</span>
                    </td>
                    <td>{tActions(entry.action)}</td>
                    <td className="text-ink/60">
                      {entry.targetType} <span className="text-ink/60">{entry.targetId.slice(-6)}</span>
                    </td>
                    <td className="text-ink/60">{meta?.reason ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
