import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col justify-center px-4">
      <h1 className="display text-2xl text-ink">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-ink/70">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-6 w-fit text-sm font-medium text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink/50"
      >
        {t("goHome")}
      </Link>
    </main>
  );
}
