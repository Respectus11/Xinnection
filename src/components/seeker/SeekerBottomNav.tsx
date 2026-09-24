"use client";
import React from "react";
import Link from "next/link";

interface SeekerBottomNavProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function SeekerBottomNav({ onSubmit, isSubmitting, disabled }: SeekerBottomNavProps) {
  return (
    <>
      {/* Additional Ambient Grounding Card */}
      <section className="mt-1 p-4 rounded-xl bg-elevated-onyx/70 border border-outline-variant/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">favorite</span>
        <div className="flex flex-col gap-0.5">
          <span className="font-headline-sm text-sm font-semibold text-starlight-white">Always here, without timer</span>
          <p className="font-body-sm text-body-sm text-muted-silver">Every response is voluntary, attentive, and handled by peers who walk the road with you.</p>
        </div>
      </section>

      {/* Sticky Bottom Action Area & Navigation Wrapper */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
        {/* Primary CTA Floating Tray (with blur over canvas) */}
        <div className="w-full max-w-md px-margin pb-2 pt-3 bg-gradient-to-t from-canvas-deep via-canvas-deep/95 to-transparent backdrop-blur-sm flex flex-col items-center gap-1.5">
          <button 
            className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-primary-container/20 hover:brightness-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:active:scale-100" 
            type="button"
            onClick={onSubmit}
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Submit Anonymously</span>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </>
            )}
          </button>
        </div>
        
        {/* Global Bottom Navigation Bar */}
        <nav className="w-full h-16 bg-surface-container border-t border-outline-variant/30 flex justify-around items-center px-2 pb-safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
          <Link href="/" className="flex flex-col items-center justify-center w-16 h-full text-primary gap-1 cursor-pointer">
            <div className="relative">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-tertiary rounded-full border-2 border-surface-container"></span>
            </div>
            <span className="text-[10px] font-label font-medium tracking-wide">Home</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">history</span>
            <span className="text-[10px] font-label font-medium tracking-wide">History</span>
          </Link>
          <Link href="/resources" className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">local_library</span>
            <span className="text-[10px] font-label font-medium tracking-wide">Library</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="text-[10px] font-label font-medium tracking-wide">Settings</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
