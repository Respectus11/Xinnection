import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
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

  const inputClasses =
    "rounded border border-line bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">{t("prosTitle")}</h1>
      <form className="mt-4 flex max-w-xl flex-wrap gap-2" method="get">
        <input name="q" defaultValue={q ?? ""} placeholder={t("searchPlaceholder")} className={`${inputClasses} w-full sm:w-auto sm:flex-1`} />
        <button
          type="submit"
          className="rounded border border-ink/30 px-4 py-2 text-sm font-medium hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {t("apply")}
        </button>
        {q ? (
          <a href="?" className="self-center text-sm underline underline-offset-4">
            {t("clear")}
          </a>
        ) : null}
      </form>
      <ul className="mt-6 border-t border-line">
        {professionals.map((professional) => (
          <li key={professional.id} className="border-b border-line py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{professional.fullName}</p>
                <p className="text-sm text-ink/60">
                  {professional.email} — {professional.specialty} — {professional.languages.join(", ")}
                </p>
              </div>
              <Badge tone={STATUS_TONES[professional.status] ?? "neutral"}>
                {tPro(professional.status.toLowerCase())}
              </Badge>
            </div>
            <div className="mt-3">
              <ProfessionalActions professionalId={professional.id} status={professional.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
