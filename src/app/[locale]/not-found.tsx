import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-ink/70">{t("notFoundBody")}</p>
      <Link href="/" className="mt-6 underline underline-offset-4">
        {t("goHome")}
      </Link>
    </main>
  );
}
