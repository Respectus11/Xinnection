import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <main className="min-h-screen flex flex-col bg-deep-midnight text-starlight-white font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-azure-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-vibrant-coral/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/50 border border-outline-variant/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-mint-text animate-pulse" />
            <span className="text-label-sm font-label-sm tracking-wide text-starlight-white/80">Zero-Logs Encrypted Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-semibold tracking-tight leading-tight">
            Safe space to <span className="text-transparent bg-clip-text bg-gradient-to-r from-azure-blue to-lavender-text">speak out.</span>
          </h1>
          
          <p className="text-body-lg text-muted-silver max-w-2xl mx-auto leading-relaxed">
            Xinnection provides an anonymous, untraceable bridge between you and verified mental health professionals. No identity required, no records kept.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto mt-8">
          <Link
            href="/thread"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-starlight-white text-deep-midnight rounded-full font-label-lg font-semibold overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-starlight-white/10"
          >
            <span className="relative z-10">Get Help Anonymously</span>
            <span className="material-symbols-outlined relative z-10 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            <div className="absolute inset-0 bg-gradient-to-r from-starlight-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/auth"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-container-high/40 hover:bg-surface-container-high/60 border border-outline-variant/30 text-starlight-white rounded-full font-label-lg font-medium transition-all backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-muted-silver text-xl">shield_person</span>
            <span>Responder Login</span>
          </Link>
        </div>

      </div>

      {/* Footer / Trust Indicators */}
      <footer className="relative z-10 w-full py-8 border-t border-outline-variant/20 bg-surface-container/30 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-azure-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-deep-midnight text-[14px]">lock</span>
            </div>
            <span className="font-display font-bold tracking-wide text-starlight-white">Xinnection</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-label-sm text-muted-silver font-mono-data">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">visibility_off</span> End-to-End Encrypted</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">vpn_key</span> No IP Logging</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">delete_history</span> Ephemeral Data</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
