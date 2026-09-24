"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";



export function SeekerCodeView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("c") || "XXXX-XXXX";
  
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token).then(() => {
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2000);
      });
    } else {
      // Fallback
      const tempInput = document.createElement("input");
      tempInput.value = token;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const handleSaveScreenshot = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 800);
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md antialiased min-h-[100dvh] flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container pb-28 relative">
      {/* Mobile Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-canvas-deep/95 backdrop-blur-md px-margin py-space-sm flex items-center justify-between shadow-sm">
        {/* Back Action Button */}
        <button 
          onClick={() => router.back()} 
          aria-label="Go back" 
          className="w-10 h-10 rounded-full bg-elevated-onyx flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-95 transition-all duration-150" 
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {/* Center Screen Title */}
        <h1 className="font-headline-sm text-headline-sm text-starlight-white font-semibold tracking-tight">
          Anonymous Access
        </h1>
        {/* Encrypted Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated-onyx text-muted-silver text-label font-label border border-white/5">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
          <span className="text-[11px] tracking-wide text-starlight-white/90">Zero Logs</span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-md mx-auto px-margin pt-space-md flex flex-col gap-y-space-lg flex-1">
        {/* Section 1: Prominent Success & Token Generation Header */}
        <section className="flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint/15 text-tertiary font-label text-label mb-space-sm border border-mint/20 shadow-sm">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="font-medium tracking-wide">Token Issued & Active</span>
          </div>
          {/* Headline */}
          <h2 className="font-headline-lg text-headline-lg text-starlight-white font-bold tracking-tight mb-space-xs">
            Secure Access Key Generated.
          </h2>
          {/* Subtitle */}
          <p className="font-body-md text-body-md text-muted-silver max-w-xs leading-relaxed">
            Your private key to return to this peer thread anytime, completely anonymously.
          </p>
        </section>

        {/* Section 2: Core Recovery Code & QR Elevated Card */}
        <section className="bg-elevated-onyx rounded-DEFAULT p-space-md shadow-lg border border-white/5 relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Card Internal Header */}
          <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">key</span>
              <span className="font-label text-label text-muted-silver uppercase tracking-wider font-semibold">Anonymous Recovery Code</span>
            </div>
            <button 
              onClick={handleCopy} 
              aria-label="Copy recovery code" 
              className="p-1 rounded-full text-muted-silver hover:text-starlight-white active:scale-90 transition-all duration-150" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>

          {/* Alphanumeric Token Presentation Box */}
          <div className="bg-canvas-deep/80 rounded-DEFAULT p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-space-md border border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-silver text-sm">lock_clock</span>
              <span className="font-mono-data text-headline-sm font-bold text-starlight-white tracking-widest selection:bg-primary-container">
                {token}
              </span>
            </div>
            {/* Tap to Copy Pill Button */}
            <button 
              onClick={handleCopy} 
              className="w-full sm:w-auto px-3 py-1 rounded-full bg-elevated-onyx hover:bg-white/10 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/10 shadow-sm" 
              type="button"
            >
              <span className="material-symbols-outlined text-xs">content_copy</span>
              <span>{copyState === "copied" ? "Copied!" : "Tap to Copy"}</span>
            </button>
          </div>

          {/* High-Contrast Crisp QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative bg-starlight-white p-4 rounded-DEFAULT shadow-md flex items-center justify-center w-52 h-52 transition-transform duration-200 hover:scale-[1.01]">
              {/* Synthetic QR Mockup */}
              <svg aria-label="QR Code Representation" className="w-full h-full text-canvas-deep" fill="currentColor" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <rect height="40" rx="6" width="40" x="10" y="10"></rect>
                <rect fill="#FAFAFA" height="28" rx="3" width="28" x="16" y="16"></rect>
                <rect height="16" rx="2" width="16" x="22" y="22"></rect>
                
                <rect height="40" rx="6" width="40" x="110" y="10"></rect>
                <rect fill="#FAFAFA" height="28" rx="3" width="28" x="116" y="16"></rect>
                <rect height="16" rx="2" width="16" x="122" y="22"></rect>
                
                <rect height="40" rx="6" width="40" x="10" y="110"></rect>
                <rect fill="#FAFAFA" height="28" rx="3" width="28" x="16" y="116"></rect>
                <rect height="16" rx="2" width="16" x="22" y="122"></rect>
                
                {/* Random blocks for mockup */}
                <rect height="8" rx="1.5" width="8" x="60" y="12"></rect>
                <rect height="8" rx="1.5" width="14" x="76" y="12"></rect>
                <rect height="8" rx="1.5" width="6" x="96" y="12"></rect>
                <rect height="6" rx="1" width="12" x="56" y="26"></rect>
                <rect height="8" rx="1" width="8" x="74" y="26"></rect>
                <rect height="6" rx="1" width="14" x="88" y="26"></rect>
                <rect height="12" rx="1" width="6" x="58" y="38"></rect>
                <rect height="6" rx="1" width="16" x="70" y="42"></rect>
                <rect height="10" rx="1" width="10" x="92" y="38"></rect>
                <rect height="10" rx="1" width="8" x="12" y="58"></rect>
                <rect height="6" rx="1" width="12" x="26" y="58"></rect>
                <rect height="14" rx="1" width="6" x="42" y="58"></rect>
                <rect height="10" rx="1" width="10" x="112" y="58"></rect>
                <rect height="6" rx="1" width="18" x="128" y="58"></rect>
                <rect height="8" rx="1" width="14" x="12" y="74"></rect>
                <rect height="16" rx="1" width="6" x="32" y="72"></rect>
                <rect height="14" rx="1" width="8" x="118" y="74"></rect>
                <rect height="8" rx="1" width="14" x="134" y="74"></rect>
                <rect height="8" rx="1" width="8" x="14" y="94"></rect>
                <rect height="6" rx="1" width="18" x="28" y="92"></rect>
                <rect height="6" rx="1" width="12" x="112" y="92"></rect>
                <rect height="12" rx="1" width="6" x="130" y="92"></rect>
                
                {/* Bottom Matrix */}
                <rect height="8" rx="1" width="12" x="58" y="112"></rect>
                <rect height="6" rx="1" width="14" x="76" y="112"></rect>
                <rect height="8" rx="1" width="8" x="96" y="112"></rect>
                <rect height="14" rx="1" width="8" x="114" y="112"></rect>
                <rect height="8" rx="1" width="16" x="130" y="114"></rect>
                <rect height="14" rx="1" width="8" x="58" y="126"></rect>
                <rect height="8" rx="1" width="18" x="72" y="124"></rect>
                <rect height="6" rx="1" width="12" x="96" y="126"></rect>
                <rect height="8" rx="1" width="14" x="114" y="132"></rect>
                <rect height="14" rx="1" width="12" x="134" y="128"></rect>
                <rect height="6" rx="1" width="18" x="58" y="144"></rect>
                <rect height="8" rx="1" width="10" x="82" y="142"></rect>
                <rect height="8" rx="1" width="8" x="98" y="142"></rect>
                <rect height="6" rx="1" width="34" x="112" y="146"></rect>

                {/* Core Cutout */}
                <rect fill="#FAFAFA" height="36" rx="10" width="36" x="62" y="62"></rect>
                <rect fill="#18181B" height="28" rx="8" width="28" x="66" y="66"></rect>
              </svg>
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-primary-container text-xl">lock</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-muted-silver mt-2">Scan from another device to sync thread</p>
          </div>

          {/* Quick Utility Action Buttons Row */}
          <div className="grid grid-cols-2 gap-space-sm mt-space-md">
            <button 
              onClick={handleCopy} 
              className="py-2.5 px-3 rounded-full bg-canvas-deep hover:bg-canvas-deep/60 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/5" 
              type="button"
            >
              <span className="material-symbols-outlined text-base text-primary-container">content_copy</span>
              <span>{copyState === "copied" ? "Copied!" : "Copy Code"}</span>
            </button>
            <button 
              onClick={handleSaveScreenshot}
              className="py-2.5 px-3 rounded-full bg-canvas-deep hover:bg-canvas-deep/60 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/5" 
              type="button"
            >
              <span className="material-symbols-outlined text-base text-secondary">download</span>
              <span>
                {saveState === "saving" ? "Downloading..." : saveState === "saved" ? "Image Saved" : "Save Image"}
              </span>
            </button>
          </div>
        </section>

        {/* Section 3: Empathetic Instructions & Security Notice Card */}
        <section className="bg-elevated-onyx rounded-DEFAULT p-space-md border-l-4 border-peach border-t border-r border-b border-white/5 space-y-space-sm shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-peach text-xl shrink-0 mt-0.5">warning</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-starlight-white text-sm font-semibold">Important Privacy Safeguard</h3>
              <p className="font-body-md text-body-md text-muted-silver text-xs leading-relaxed mt-1">
                Take a screenshot of this page or write this code down. This is the <strong className="text-starlight-white font-medium">ONLY way</strong> to access your thread or read counselor replies. For your absolute anonymity, there is no password reset.
              </p>
            </div>
          </div>
          {/* Bulleted Safety Pillars */}
          <div className="pt-space-xs border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>Zero tracking cookies</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>Ephemeral storage</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>100% anonymous</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Navigation / Primary CTA Container */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-elevated-onyx/95 backdrop-blur-md px-margin py-3.5 shadow-lg flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col items-center gap-1.5">
          <Link href={`/en/thread/${token}`} className="w-full h-12 rounded-full bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-on-primary-container font-headline-sm text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-150">
            <span>I have saved my code, continue to thread</span>
            <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
          </Link>
          {/* Reassuring subtext */}
          <p className="font-body-sm text-body-sm text-muted-silver text-[11px] tracking-wide text-center">
            By continuing, you confirm your access key is safely stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
