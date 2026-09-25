"use client";
import React, { useState } from "react";
import Link from "next/link";

interface SeekerBottomNavProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function SeekerBottomNav({ onSubmit, isSubmitting, disabled }: SeekerBottomNavProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          <Link href="/code" className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer" title="Find existing thread by code">
            <span className="material-symbols-outlined text-[24px]">history</span>
            <span className="text-[10px] font-label font-medium tracking-wide">Enter Code</span>
          </Link>
          <button 
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer"
            title="Grounding & Self-care Library"
          >
            <span className="material-symbols-outlined text-[24px]">local_library</span>
            <span className="text-[10px] font-label font-medium tracking-wide">Library</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-full text-muted-silver hover:text-starlight-white gap-1 transition-colors cursor-pointer"
            title="Privacy Settings"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="text-[10px] font-label font-medium tracking-wide">Settings</span>
          </button>
        </nav>
      </div>

      {/* Self-Care & Grounding Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] bg-canvas-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-tertiary">
                <span className="material-symbols-outlined text-2xl">local_library</span>
                <h3 className="font-headline-sm text-lg font-bold text-starlight-white">Calming Library</h3>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-muted-silver hover:text-starlight-white"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-canvas-deep border border-tertiary/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-2xl mt-0.5">air</span>
                <div>
                  <h4 className="text-sm font-semibold text-starlight-white">4-7-8 Deep Breathing</h4>
                  <p className="text-xs text-muted-silver mt-1">Inhale softly through your nose for 4s, hold for 7s, exhale completely through your mouth for 8s.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas-deep border border-secondary/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">spa</span>
                <div>
                  <h4 className="text-sm font-semibold text-starlight-white">5-4-3-2-1 Sensory Grounding</h4>
                  <p className="text-xs text-muted-silver mt-1">Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas-deep border border-peach/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-peach text-2xl mt-0.5">phone_in_talk</span>
                <div>
                  <h4 className="text-sm font-semibold text-starlight-white">Free Crisis Lifeline</h4>
                  <p className="text-xs text-muted-silver mt-1">Dial or text <strong className="text-starlight-white">988</strong> anytime for confidential, immediate human support.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsLibraryOpen(false)}
              className="mt-5 w-full py-2.5 rounded-full bg-surface-container-high hover:bg-white/10 text-starlight-white font-medium text-sm transition-colors"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-canvas-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-2xl">shield</span>
                <h3 className="font-headline-sm text-lg font-bold text-starlight-white">Privacy Safeguards</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-muted-silver hover:text-starlight-white"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-deep border border-white/5">
                <div>
                  <span className="text-starlight-white font-medium block">Zero Tracking Cookies</span>
                  <span className="text-xs text-muted-silver">No advertising or fingerprint trackers</span>
                </div>
                <span className="material-symbols-outlined text-mint">check_circle</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-deep border border-white/5">
                <div>
                  <span className="text-starlight-white font-medium block">Ephemeral Memory Buffers</span>
                  <span className="text-xs text-muted-silver">Zero persistent plaintext stored</span>
                </div>
                <span className="material-symbols-outlined text-mint">check_circle</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-deep border border-white/5">
                <div>
                  <span className="text-starlight-white font-medium block">Emergency Shred</span>
                  <span className="text-xs text-muted-silver">Instant thread destruction on request</span>
                </div>
                <span className="material-symbols-outlined text-mint">check_circle</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="mt-5 w-full py-2.5 rounded-full bg-primary-container text-on-primary-container font-semibold text-sm transition-all"
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
