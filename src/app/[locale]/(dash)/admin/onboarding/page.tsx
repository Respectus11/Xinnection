import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/db";
import { OnboardingActions } from "./OnboardingActions";

export const dynamic = "force-dynamic";

// Professional onboarding/verification queue. Hairline-separated rows with
// the decision actions inline — approve is the quiet primary, reject asks
// for a reason before it will fire.
export default async function OnboardingPage() {
  const t = await getTranslations("admin");
  const pending = await prisma.professional.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="mx-auto max-w-4xl">
      <SectionHeading title={t("onboardingTitle")} />
      {pending.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("onboardingEmpty")} />
        </div>
      ) : (
        <ul className="mt-7 border-t border-line">
          {pending.map((professional) => (
            <li
              key={professional.id}
              className="border-b border-line py-5 transition-colors duration-150 hover:bg-white/35"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{professional.fullName}</p>
                <p className="text-sm text-ink/60">{professional.email}</p>
              </div>
              <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
                <dt className="text-ink/50">{t("credentials")}</dt>
                <dd>{professional.credentials}</dd>
                <dt className="text-ink/50">{t("license")}</dt>
                <dd className="tnum">{professional.licenseNumber}</dd>
                <dt className="text-ink/50">{t("specialty")}</dt>
                <dd>{professional.specialty}</dd>
                <dt className="text-ink/50">{t("languages")}</dt>
                <dd>{professional.languages.join(", ")}</dd>
              </dl>
              <div className="mt-4">
                <OnboardingActions professionalId={professional.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
