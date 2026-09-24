"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const [reflectionText, setReflectionText] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const handleThemeToggle = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative pb-52">
      {/* Ambient Glow Behind Deep Canvas */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-primary-container/5 blur-3xl pointer-events-none rounded-full"
      ></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-space-md py-space-sm w-full bg-surface-container/95 dark:bg-surface-container/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-elevated-onyx text-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface dark:text-on-surface tracking-tight">
            Xinnection
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-muted-silver hover:text-white transition-colors font-medium border border-outline-variant/30 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px] text-tertiary">spa</span>
            <span>Responder Login</span>
          </Link>
        </div>
      </header>

      {/* Main Scrollable Canvas */}
      <main className="w-full max-w-md mx-auto pt-16 px-margin flex flex-col gap-6">
        {/* Reassurance Banner & Grounding Micro-copy */}
        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated-onyx border border-outline-variant/40 shadow-sm text-starlight-white text-xs font-label whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="tracking-wide">24/7 Live</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated-onyx border border-outline-variant/40 shadow-sm text-muted-silver text-xs font-label whitespace-nowrap">
              <span
                className="material-symbols-outlined text-tertiary-fixed-dim text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <span className="tracking-wide">100% Anonymous &amp; Encrypted</span>
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

        {/* Interactive Reflection Composer */}
        <section className="relative">
          <div className="bg-elevated-onyx rounded-2xl p-space-md border border-outline-variant/50 shadow-xl transition-all duration-200 focus-within:border-primary-container/80 focus-within:ring-1 focus-within:ring-primary-container/40">
            {/* Status Badge Header inside Composer */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant/30">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-tertiary"></span>
                <span className="font-label text-label text-starlight-white font-medium">Safe &amp; unmoderated until shared</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/80 text-muted-silver font-mono-data text-[11px]">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                <span>Local draft</span>
              </div>
            </div>
            
            {/* Generous Textarea */}
            <div className="relative py-1">
              <textarea
                className="w-full bg-transparent border-0 resize-none text-starlight-white placeholder:text-muted-silver/60 font-body-lg text-body-lg leading-relaxed focus:outline-none focus:ring-0 p-0 custom-scrollbar"
                id="reflection-input"
                maxLength={800}
                placeholder="What is on your mind today? Write without filter..."
                rows={5}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />
            </div>
            
            {/* Composer Bottom Controls */}
            <div className="pt-3 mt-1 flex items-center justify-between border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-starlight-white transition-colors duration-150 active:scale-95 text-xs font-label"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
                  <span>Speak</span>
                </button>
                <button
                  className="p-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95"
                  title="Add gentle prompt"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_quote</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono-data text-mono-data ${
                    reflectionText.length > 700 ? "text-primary-container" : "text-muted-silver/80"
                  }`}
                  id="char-counter"
                >
                  {reflectionText.length} / 800
                </span>
              </div>
            </div>
            
            {/* Helper Assurance */}
            <div className="mt-3 pt-2 flex items-center justify-center gap-1.5 text-muted-silver/70 font-body-sm text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
              <span>Your identity remains completely hidden</span>
            </div>
          </div>
        </section>

        {/* Colorful Category Pills ('Theme Context') */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-starlight-white tracking-tight">Theme Context</h2>
            <span className="font-body-sm text-body-sm text-muted-silver">Select if applicable</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Anxiety */}
            <button
              onClick={() => handleThemeToggle("Anxiety")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-tertiary/10 border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Anxiety") ? "border-tertiary/80 ring-2 ring-tertiary/50" : "border-tertiary/25 hover:border-tertiary/60"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(82,222,162,0.8)]"></span>
              <span className="font-body-md text-body-md font-medium text-tertiary-fixed">Anxiety</span>
            </button>
            {/* Relationships */}
            <button
              onClick={() => handleThemeToggle("Relationships")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-lavender/15 border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Relationships") ? "border-lavender/80 ring-2 ring-lavender/50" : "border-lavender/30 hover:border-lavender/70"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(79,70,229,0.8)]"></span>
              <span className="font-body-md text-body-md font-medium text-secondary-fixed">Relationships</span>
            </button>
            {/* Grief */}
            <button
              onClick={() => handleThemeToggle("Grief")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-peach/15 border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Grief") ? "border-peach/80 ring-2 ring-peach/50" : "border-peach/30 hover:border-peach/70"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-peach shadow-[0_0_8px_rgba(234,88,12,0.8)]"></span>
              <span className="font-body-md text-body-md font-medium text-primary-fixed">Grief</span>
            </button>
            {/* Burnout */}
            <button
              onClick={() => handleThemeToggle("Burnout")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-rose/15 border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Burnout") ? "border-rose/80 ring-2 ring-rose/50" : "border-rose/30 hover:border-rose/70"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose shadow-[0_0_8px_rgba(219,39,119,0.8)]"></span>
              <span className="font-body-md text-body-md font-medium text-primary-fixed-dim">Burnout</span>
            </button>
            {/* Loneliness */}
            <button
              onClick={() => handleThemeToggle("Loneliness")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-secondary-container/20 border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Loneliness") ? "border-secondary-container/80 ring-2 ring-secondary-container/50" : "border-secondary-container/40 hover:border-secondary-container/80"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(5,102,217,0.8)]"></span>
              <span className="font-body-md text-body-md font-medium text-on-secondary-container">Loneliness</span>
            </button>
            {/* Transitions */}
            <button
              onClick={() => handleThemeToggle("Transitions")}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-high border transition-all duration-150 text-left active:scale-95 ${
                selectedThemes.includes("Transitions") ? "border-primary/80 ring-2 ring-primary/50" : "border-outline-variant/60 hover:border-primary/50"
              }`}
              type="button"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,179,176,0.6)]"></span>
              <span className="font-body-md text-body-md font-medium text-on-surface-variant">Transitions</span>
            </button>
          </div>
        </section>

        {/* Additional Ambient Grounding Card */}
        <section className="mt-1 p-4 rounded-xl bg-elevated-onyx/70 border border-outline-variant/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">favorite</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline-sm text-sm font-semibold text-starlight-white">Always here, without timer</span>
            <p className="font-body-sm text-body-sm text-muted-silver">Every response is voluntary, attentive, and handled by peers who walk the road with you.</p>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Area & Navigation Wrapper */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        {/* Primary CTA Floating Tray (with blur over canvas) */}
        <div className="w-full max-w-md px-margin pb-2 pt-3 bg-gradient-to-t from-canvas-deep via-canvas-deep/95 to-transparent backdrop-blur-sm flex flex-col items-center gap-1.5 pointer-events-auto">
          <Link
            href="/thread"
            className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-primary-container/20 hover:brightness-105 active:scale-95 transition-all duration-150"
          >
            <span>Submit Anonymously</span>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </Link>
          <span className="font-body-sm text-[11px] text-muted-silver/80 tracking-wide text-center">
            Encrypted &amp; untracked • Ephemeral storage
          </span>
        </div>

        {/* BottomNavBar */}
        <nav className="relative w-full z-50 flex justify-around items-center px-space-md py-space-sm bg-surface-container/95 dark:bg-surface-container/95 backdrop-blur-md shadow-lg pointer-events-auto">
          {/* Reflect (Active) */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center text-primary-container dark:text-primary-container font-semibold transition-colors duration-200 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              self_improvement
            </span>
            <span className="font-label text-label mt-0.5">Reflect</span>
          </Link>
          
          <Link
            href="/community"
            className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-200 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">groups</span>
            <span className="font-label text-label mt-0.5">Community</span>
          </Link>
          
          <Link
            href="/resources"
            className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-200 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="font-label text-label mt-0.5">Resources</span>
          </Link>
          
          <Link
            href="/support"
            className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-200 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">volunteer_activism</span>
            <span className="font-label text-label mt-0.5">Support</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
