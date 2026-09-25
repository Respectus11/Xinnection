"use client";
import React from "react";
import Link from "next/link";



export function SeekerHeader() {
  return (
    <>
      {/* Ambient Glow Behind Deep Canvas */}
      <div 
        aria-hidden="true" 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-primary-container/5 blur-3xl pointer-events-none rounded-full"
      />
      
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-space-md py-space-sm w-full bg-surface-container/95 dark:bg-surface-container/95 backdrop-blur-md shadow-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="p-1.5 rounded-full bg-elevated-onyx text-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface dark:text-on-surface tracking-tight">
            Xinnection
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="tel:988"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose/15 text-rose border border-rose/30 text-xs font-label hover:bg-rose/25 transition-colors"
            title="Immediate Crisis Line 988"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse"></span>
            <span>Crisis 988</span>
          </a>
          <Link 
            href="/auth"
            className="text-xs px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-muted-silver hover:text-starlight-white font-medium border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-tertiary">spa</span>
            <span>Responder Login</span>
          </Link>
        </div>
      </header>
    </>
  );
}
