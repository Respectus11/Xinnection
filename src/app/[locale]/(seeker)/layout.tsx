import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { HeaderCheckReplyLink } from "@/components/seeker/HeaderCheckReplyLink";

export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  return (
    <div className="atmosphere flex min-h-screen flex-col">
      {/* Architectural header — glass strip over smoked obsidian */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: "rgba(9,13,21,0.85)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[68rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline" style={{ color: "#F1F5F9" }}>
            <span style={{ color: "#4ED8BD" }}>
              <HighlandsMark variant="mark" className="h-6 w-auto" />
            </span>
            <span className="display text-xl font-bold tracking-tight" style={{ color: "#F1F5F9" }}>
              {t("appName")}
            </span>
          </Link>
          <HeaderCheckReplyLink label={t("checkReplies")} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer — architectural obsidian register */}
      <footer
        className="atmosphere-dusk"
        style={{ background: "rgba(9,13,21,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto max-w-[68rem] px-5 py-12 sm:px-8">
          <div className="flex items-center gap-3">
            <span style={{ color: "#4ED8BD" }}>
              <HighlandsMark variant="mark" className="h-5 w-auto" />
            </span>
            <span className="display text-base font-semibold" style={{ color: "#F1F5F9" }}>
              {t("appName")}
            </span>
          </div>
          <p className="mt-2 text-sm" style={{ color: "rgba(148,163,184,0.75)" }}>
            {t("tagline")}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.6)" }}>
            {tFooter("crisisNote")}
          </p>
          <p className="mt-2 text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
            {tFooter("lookupNote")}
          </p>

          {/* Professional and staff access */}
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
              {t("appName")} &bull; Confidential & Anonymous Support
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/professional/login"
                className="transition-colors hover:text-[#4ED8BD] underline-offset-4 hover:underline"
                style={{ color: "rgba(148,163,184,0.7)" }}
              >
                Professional Portal
              </Link>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>&bull;</span>
              <Link
                href="/admin/login"
                className="transition-colors hover:text-[#4ED8BD] underline-offset-4 hover:underline"
                style={{ color: "rgba(148,163,184,0.45)" }}
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
