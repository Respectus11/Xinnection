import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";

// The seeker shell: a narrow, airy reading column on mist with ambient light.
// Chrome stays nearly invisible; the footer carries the dusk register and the
// motif — the only dark moment on this side of the product.
export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  return (
    <div className="atmosphere flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-mist/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[42rem] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
            <HighlandsMark variant="mark" className="h-5 w-auto text-eucalyptus" />
            <span className="display text-lg">{t("appName")}</span>
          </Link>
          <Link
            href="/thread"
            className="text-sm font-medium text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink/50"
          >
            {t("checkReplies")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[42rem] px-4 py-10 sm:px-6 sm:py-14">{children}</div>
      </main>

      <footer className="atmosphere-dusk bg-dusk text-mist">
        <div className="mx-auto max-w-[42rem] px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2.5">
            <HighlandsMark variant="mark" className="h-5 w-auto text-mist/70" />
            <span className="display text-base">{t("appName")}</span>
          </div>
          <p className="mt-3 text-sm text-mist/70">{t("tagline")}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist/60">
            {tFooter("crisisNote")}
          </p>
          <p className="mt-2 text-xs text-mist/55">{tFooter("lookupNote")}</p>
        </div>
      </footer>
    </div>
  );
}
