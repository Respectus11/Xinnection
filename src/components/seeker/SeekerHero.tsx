"use client";
import React from "react";



export function SeekerHero() {
  return (
    <>
      {/* Reassurance Banner & Grounding Micro-copy */}
      <div className="pt-2 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated-onyx border border-outline-variant/40 shadow-sm text-starlight-white text-xs font-label">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span className="tracking-wide">Peer Network Live</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated-onyx border border-outline-variant/40 shadow-sm text-muted-silver text-xs font-label">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="tracking-wide">100% Anonymous & Encrypted</span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm italic text-muted-silver/90 text-center tracking-wide">
          Take your time. Pause. Exhale.
        </p>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col gap-2.5 text-left pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          WE GET YOU.<br />
          <span className="text-[#FF6B6B]">WE GOT YOU.</span>
        </h1>
        <p className="font-body-md text-body-md text-muted-silver leading-relaxed max-w-sm">
          Unhurried, gentle listening without judgment. Connect with verified peer companions guarded by strict end-to-end privacy.
        </p>
      </section>
    </>
  );
}
