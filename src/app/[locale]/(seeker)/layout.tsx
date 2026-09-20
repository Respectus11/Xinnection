import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { HeaderCheckReplyLink } from "@/components/seeker/HeaderCheckReplyLink";
import { LanguageDropdown } from "@/components/ui/LanguageDropdown";

export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  return (
    <div className="atmosphere flex min-h-screen flex-col">
      {/* Architectural header — glass strip over smoked obsidian */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: "rgba(168, 205, 199, 0.88)",
          borderColor: "rgba(0, 0, 0, 0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <HighlandsMark variant="mark" className="h-8 w-8 transition-transform duration-200 group-hover:scale-105" />
            <span className="display text-2xl font-bold tracking-tight text-[#111827]">
              {t("appName")}
            </span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <LanguageDropdown variant="header" />
            <HeaderCheckReplyLink label={t("checkReplies")} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer — architectural obsidian register */}
      <footer
        className="atmosphere-dusk safe-bottom"
        style={{ background: "rgba(9,13,21,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto max-w-[68rem] px-5 py-12 sm:px-8">
          <div className="flex items-center gap-3">
            <HighlandsMark variant="mark" className="h-8 w-8" />
            <span className="display text-base font-semibold" style={{ color: "#F1F5F9" }}>
              {t("appName")}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: "rgba(203,213,225,0.9)" }}>
            {t("tagline")}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(203,213,225,0.85)" }}>
            {tFooter("crisisNote")}
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(160,175,200,0.8)" }}>
            {tFooter("lookupNote")}
          </p>

          {/* Professional and staff access */}
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(160,175,200,0.8)" }}>
              {t("appName")} &bull; Confidential & Anonymous Support
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/professional/login"
                className="btn-press min-h-[44px] inline-flex items-center font-medium transition-colors hover:text-[#4ED8BD] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
                style={{ color: "rgba(226,232,240,0.88)" }}
              >
                Professional Portal
              </Link>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>&bull;</span>
              <Link
                href="/admin/login"
                className="btn-press min-h-[44px] inline-flex items-center font-medium transition-colors hover:text-[#4ED8BD] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
                style={{ color: "rgba(160,175,200,0.8)" }}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
