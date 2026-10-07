"use client";

import React, { useState, useEffect, useCallback } from "react";

export type ProfessionalProfile = {
  id: string;
  fullName: string;
  specialty: string;
  languages: string[];
  bio: string | null;
  photoUrl: string | null;
};

interface ProfessionalPickerProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  am: "Amharic",
  om: "Oromo",
  ti: "Tigrinya",
};

export function ProfessionalPicker({ selectedId, onSelect, onClose }: ProfessionalPickerProps) {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/professionals");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProfessionals(data);
    } catch {
      setError("Could not load professionals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = professionals.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.specialty.toLowerCase().includes(q) ||
      p.bio?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose your responder"
    >
      {/* Sheet / Modal */}
      <div className="bg-elevated-onyx border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
          <div>
            <h2 className="font-headline-sm text-base font-bold text-starlight-white tracking-tight">
              Choose Your Responder
            </h2>
            <p className="text-xs text-muted-silver mt-0.5">
              Select a professional or let any available responder assist you.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close picker"
            className="w-8 h-8 rounded-full bg-canvas-deep/60 flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-90 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 bg-canvas-deep/70 border border-white/10 rounded-xl px-3 py-2 focus-within:border-secondary/50 transition-colors">
            <span className="material-symbols-outlined text-muted-silver text-sm">search</span>
            <input
              type="text"
              placeholder="Search by name or specialty…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-starlight-white text-sm placeholder:text-muted-silver/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-silver hover:text-starlight-white"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2 no-scrollbar">

          {/* "Any responder" option — always first */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-all duration-150 active:scale-[0.99] ${
              selectedId === null
                ? "border-secondary/60 bg-secondary/10 ring-1 ring-secondary/40"
                : "border-white/8 bg-canvas-deep/50 hover:border-white/20 hover:bg-canvas-deep/80"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-lavender/20 border border-lavender/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-xl">groups</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-starlight-white">Any Available Responder</p>
              <p className="text-xs text-muted-silver mt-0.5 leading-relaxed">
                The first available verified professional will respond to you.
              </p>
            </div>
            {selectedId === null && (
              <span className="material-symbols-outlined text-secondary text-xl shrink-0">check_circle</span>
            )}
          </button>

          {/* Loading skeleton */}
          {isLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-canvas-deep/50 px-4 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded-full w-2/3" />
                    <div className="h-2 bg-white/8 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-4 flex flex-col items-center gap-2 text-center">
              <span className="material-symbols-outlined text-rose text-2xl">error_outline</span>
              <p className="text-xs text-rose">{error}</p>
              <button
                onClick={fetchProfessionals}
                className="text-xs text-primary-container underline"
                type="button"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && searchQuery && (
            <div className="py-8 text-center text-muted-silver text-xs">
              No professionals match &ldquo;{searchQuery}&rdquo;
            </div>
          )}

          {/* Professional cards */}
          {!isLoading &&
            !error &&
            filtered.map((pro) => (
              <button
                key={pro.id}
                type="button"
                onClick={() => handleSelect(pro.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 flex items-start gap-3 transition-all duration-150 active:scale-[0.99] ${
                  selectedId === pro.id
                    ? "border-secondary/60 bg-secondary/10 ring-1 ring-secondary/40"
                    : "border-white/8 bg-canvas-deep/50 hover:border-white/20 hover:bg-canvas-deep/80"
                }`}
              >
                {/* Avatar */}
                {pro.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pro.photoUrl}
                    alt={pro.fullName}
                    className="w-11 h-11 rounded-full object-cover border border-lavender/40 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-lavender/20 border border-lavender/40 flex items-center justify-center shrink-0 text-secondary font-bold text-base">
                    {pro.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-starlight-white leading-tight">{pro.fullName}</p>
                      <p className="text-xs text-secondary mt-0.5">{pro.specialty}</p>
                    </div>
                    {selectedId === pro.id && (
                      <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">check_circle</span>
                    )}
                  </div>

                  {/* Bio */}
                  {pro.bio && (
                    <p className="text-xs text-muted-silver mt-1.5 leading-relaxed line-clamp-2">
                      {pro.bio}
                    </p>
                  )}

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pro.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-full bg-surface-container-high/80 border border-white/8 text-muted-silver text-[10px] font-label"
                      >
                        {LANGUAGE_LABELS[lang] ?? lang}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-white/8">
          <button
            type="button"
            onClick={() => handleSelect(selectedId)}
            className="w-full h-11 rounded-full bg-primary-container hover:brightness-110 active:scale-[0.98] text-starlight-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-150"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            <span>Confirm Selection</span>
          </button>
          <p className="text-center text-[10px] text-muted-silver mt-2">
            Your identity remains completely hidden regardless of who you choose.
          </p>
        </div>
      </div>
    </div>
  );
}
