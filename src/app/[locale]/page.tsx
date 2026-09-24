export default function HomePage() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div className="max-w-xl space-y-4">
        <div className="inline-block px-3 py-1 text-xs font-mono tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
          Clean Slate
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Ready for Stitch Design
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Previous frontend components and views have been cleared. Ready to generate and integrate fresh designs using Google Stitch skills.
        </p>
      </div>
    </main>
  );
}
