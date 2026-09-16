import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/fields";
import { prisma } from "@/lib/db";
import { ProfessionalActions } from "./ProfessionalActions";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, "eucalyptus" | "flag" | "neutral"> = {
  ACTIVE: "eucalyptus",
  SUSPENDED: "flag",
  PENDING: "neutral",
};

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("admin");
  const tPro = await getTranslations("proStatus");

  const professionals = await prisma.professional.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { licenseNumber: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-4xl">
      <SectionHeading title={t("prosTitle")} />
      <form className="mt-5 flex max-w-xl flex-wrap items-center gap-2" method="get">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="w-full sm:flex-1"
        />
        <Button type="submit" variant="secondary">
          {t("apply")}
        </Button>
        {q ? (
          <a
            href="?"
            className="text-sm underline decoration-ink/30 underline-offset-4 transition-colors duration-150 hover:decoration-ink"
          >
            {t("clear")}
          </a>
        ) : null}
      </form>
      {professionals.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("prosEmpty")} />
        </div>
      ) : (
        <ul className="mt-7 border-t border-line">
          {professionals.map((professional) => (
            <li
              key={professional.id}
              className="border-b border-line py-5 transition-colors duration-150 rounded-lg px-2 hover:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{professional.fullName}</p>
                  <p className="mt-0.5 text-sm text-ink/60">
                    {professional.email} — {professional.specialty} —{" "}
                    {professional.languages.join(", ")}
                  </p>
                </div>
                <Badge tone={STATUS_TONES[professional.status] ?? "neutral"}>
                  {tPro(professional.status.toLowerCase())}
                </Badge>
              </div>
              <div className="mt-4">
                <ProfessionalActions professionalId={professional.id} status={professional.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
