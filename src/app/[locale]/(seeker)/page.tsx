"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SeekerHeader } from "@/components/seeker/SeekerHeader";
import { SeekerHero } from "@/components/seeker/SeekerHero";
import { ReflectionComposer } from "@/components/seeker/ReflectionComposer";
import { CategoryPillsGrid } from "@/components/seeker/CategoryPillsGrid";
import { SeekerBottomNav } from "@/components/seeker/SeekerBottomNav";
import { ProfessionalPicker } from "@/components/seeker/ProfessionalPicker";

export default function SeekerLandingPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("other");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Professional selection state
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !categorySlug) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          categorySlug,
          language: "en",
          preferredProfessionalId: selectedProfessionalId ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();
      router.push(`/en/code?c=${data.code}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative pb-52">
      <SeekerHeader />

      {/* Main Scrollable Canvas */}
      <main className="w-full max-w-md mx-auto pt-16 px-margin flex flex-col gap-6">
        <SeekerHero />
        <ReflectionComposer content={content} onChange={setContent} />
        <CategoryPillsGrid selectedCategory={categorySlug} onSelect={setCategorySlug} />

        {/* Choose Your Responder Button */}
        <section>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-elevated-onyx hover:border-secondary/40 hover:bg-elevated-onyx/80 active:scale-[0.99] transition-all duration-150 shadow-sm group"
            aria-label="Choose who responds to you"
          >
            {/* Avatar / icon */}
            <div className="w-10 h-10 rounded-full bg-lavender/20 border border-lavender/40 flex items-center justify-center shrink-0 text-secondary group-hover:border-secondary/60 transition-colors">
              <span className="material-symbols-outlined text-xl">
                {selectedProfessionalId ? "person" : "groups"}
              </span>
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-starlight-white">Choose Your Responder</p>
              <p className="text-[11px] text-muted-silver truncate mt-0.5">
                {selectedProfessionalId
                  ? "Specific professional selected — tap to change"
                  : "Any available professional will respond (default)"}
              </p>
            </div>

            <span className="material-symbols-outlined text-muted-silver text-lg group-hover:text-starlight-white transition-colors">
              chevron_right
            </span>
          </button>
        </section>
        <section className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5 pb-20">
          <a
            href="mailto:feedback@xinnection.org"
            className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-canvas-deep border border-white/10 hover:border-white/20 transition-colors group"
          >
            <span className="material-symbols-outlined text-muted-silver group-hover:text-starlight-white mb-2">rate_review</span>
            <span className="text-sm font-semibold text-starlight-white">Feedback</span>
            <span className="text-[11px] text-muted-silver text-center mt-1">Help us improve</span>
          </a>
          
          <a
            href="mailto:volunteer@xinnection.org"
            className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-canvas-deep border border-white/10 hover:border-white/20 transition-colors group"
          >
            <span className="material-symbols-outlined text-muted-silver group-hover:text-starlight-white mb-2">volunteer_activism</span>
            <span className="text-sm font-semibold text-starlight-white">Join Us</span>
            <span className="text-[11px] text-muted-silver text-center mt-1">Become a volunteer</span>
          </a>
        </section>
      </main>

      <SeekerBottomNav
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        disabled={!content.trim() || !categorySlug}
      />

      {/* Professional Picker Modal */}
      {isPickerOpen && (
        <ProfessionalPicker
          selectedId={selectedProfessionalId}
          onSelect={setSelectedProfessionalId}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
