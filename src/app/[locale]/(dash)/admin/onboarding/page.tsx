import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { OnboardingActions } from "./OnboardingActions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const t = await getTranslations("admin");
  const pending = await prisma.professional.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">{t("onboardingTitle")}</h1>
      {pending.length === 0 ? (
        <p className="mt-8 text-ink/70">{t("onboardingEmpty")}</p>
      ) : (
        <ul className="mt-6 border-t border-line">
          {pending.map((professional) => (
            <li key={professional.id} className="border-b border-line py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{professional.fullName}</p>
                <p className="text-sm text-ink/60">{professional.email}</p>
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                <dt className="text-ink/50">{t("credentials")}</dt>
                <dd>{professional.credentials}</dd>
                <dt className="text-ink/50">{t("license")}</dt>
                <dd>{professional.licenseNumber}</dd>
                <dt className="text-ink/50">{t("specialty")}</dt>
                <dd>{professional.specialty}</dd>
                <dt className="text-ink/50">{t("languages")}</dt>
                <dd>{professional.languages.join(", ")}</dd>
              </dl>
              <div className="mt-3">
                <OnboardingActions professionalId={professional.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
