"use client";
import React from "react";



export function ReflectionComposer() {
  return (
    <section className="relative">
      <div className="bg-elevated-onyx rounded-2xl p-space-md border border-outline-variant/50 shadow-xl transition-all duration-200 focus-within:border-primary-container/80 focus-within:ring-1 focus-within:ring-primary-container/40">
        {/* Status Badge Header inside Composer */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-tertiary"></span>
            <span className="font-label text-label text-starlight-white font-medium">Safe & unmoderated until shared</span>
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
          />
        </div>
        
        {/* Composer Bottom Controls */}
        <div className="pt-3 mt-1 flex items-center justify-between border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-starlight-white transition-colors duration-150 active:scale-95 text-xs font-label" type="button">
              <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
              <span>Speak</span>
            </button>
            <button className="p-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95" title="Add gentle prompt" type="button">
              <span className="material-symbols-outlined text-[18px]">format_quote</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-mono-data text-muted-silver/80" id="char-counter">0 / 800</span>
          </div>
        </div>
        
        {/* Helper Assurance */}
        <div className="mt-3 pt-2 flex items-center justify-center gap-1.5 text-muted-silver/70 font-body-sm text-[11px]">
          <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
          <span>Your identity remains completely hidden</span>
        </div>
      </div>
    </section>
  );
}
