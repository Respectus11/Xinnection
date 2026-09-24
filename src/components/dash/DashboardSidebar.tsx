"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { MetricsData } from "./LiveMetricsRibbon";

export function DashboardSidebar({ metrics }: { metrics: MetricsData }) {
  return (
    <aside className="h-screen w-64 flex flex-col justify-between p-space-md shrink-0 bg-pure-surface dark:bg-inverse-surface shadow-sm dark:shadow-none select-none z-20">
      {/* Top Area: Brand & Responder Profile */}
      <div className="flex flex-col gap-space-md">
        {/* Brand Logo / Product Anchor */}
        <Link href="/" className="flex items-center gap-space-sm px-space-xs pt-space-xs cursor-pointer hover:opacity-90">
          <div className="w-8 h-8 rounded-full bg-vibrant-coral flex items-center justify-center text-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
          </div>
          <div>
            <span className="text-headline-sm font-headline-sm font-bold text-deep-midnight dark:text-inverse-on-surface tracking-tight">Xinnection</span>
            <span className="text-mono-data font-mono-data text-warm-slate block text-[10px] leading-3 uppercase tracking-wider">Clinical Workspace</span>
          </div>
        </Link>
        
        {/* Responder Status Card */}
        <div className="bg-surface-container-low dark:bg-surface-container-highest p-space-sm rounded-DEFAULT flex items-center gap-space-sm">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full shadow-sm ring-2 ring-white overflow-hidden bg-surface-container">
               {/* Using a placeholder div for the image to avoid external dependencies, or could use Next Image */}
               <img alt="Dr. Aris Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCJybpGiJYlWXbv86jOAhzYcmkWqmu45FMoB6mVmAyisB-Qk86l-G9-vvZ-zYTvpV-k3rmFFLEWPcseZAoNLSgpYnOTlBDD7_L1gq3UAujLqbmtXoJiqCNkaUlEWBI-3ztUqbit03-naJeH68NNEZvULly6RhLkvPFu1ZDJqxgIGeBVi4Nx6P4uc7j6HchyAKL9rViDM5s_veqBHqxPjJrS9o6GNk0waWrOHv1EHXVXy4y9_vlLQyMoFrO9dWbLh5Kj-Nu1W371qk" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-mint-text rounded-full ring-2 ring-white" title="Active on duty"></span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-label-md font-label-md text-deep-midnight dark:text-inverse-on-surface truncate">Dr. Aris Thorne, LCSW</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-vibrant-coral animate-ping"></span>
              <span className="text-mono-data font-mono-data text-warm-slate truncate">On-Shift • Crisis Tier 2</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1 mt-space-xs">
          {/* Live Triage Queue (ACTIVE TAB) */}
          <Link href="/professional" className="flex items-center justify-between px-space-md py-space-sm rounded-lg bg-surface-container-low dark:bg-surface-container-highest text-primary dark:text-inverse-primary font-medium cursor-pointer active:scale-[0.99] transition-transform duration-150">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
              <span className="text-label-md font-label-md">Live Triage Queue</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-primary text-white font-medium">{metrics.totalQueue}</span>
          </Link>
          
          {/* Escalations */}
          <Link href="/professional/escalations" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-vibrant-coral">warning</span>
              <span className="text-label-md font-label-md">Escalations</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-rose-bg text-rose-text font-semibold">{metrics.escalations}</span>
          </Link>
          
          {/* My Active Chats */}
          <Link href="/professional/chats" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined">forum</span>
              <span className="text-label-md font-label-md">My Active Chats</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-surface-container-high text-warm-slate">{metrics.activeChats}</span>
          </Link>
          
          {/* Handoff Log */}
          <Link href="/professional/handoff" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined">swap_horiz</span>
              <span className="text-label-md font-label-md">Handoff Log</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-surface-container-high text-warm-slate">{metrics.handoffLog}</span>
          </Link>
          
          {/* Supervision & Insights */}
          <Link href="/professional/insights" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-label-md font-label-md">Supervision & Insights</span>
            </div>
          </Link>
        </nav>
      </div>
      
      {/* Bottom Area: Shift Protocols & Duty Control */}
      <div className="flex flex-col gap-2 pt-space-md border-t border-surface-container-high/60">
        {/* Audio alert pulse status */}
        <div className="flex items-center justify-between px-space-sm py-1.5 rounded-md bg-surface-container-low/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-warm-slate text-sm">volume_up</span>
            <span className="text-mono-data font-mono-data text-warm-slate text-[11px]">Audio Tone Alerts</span>
          </div>
          <span className="text-mono-data font-mono-data text-mint-text bg-mint-bg px-2 py-0.5 rounded text-[11px] font-medium">Chime On</span>
        </div>
        
        {/* Footer navigation tabs */}
        <Link href="/professional/protocols" className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-warm-slate hover:text-deep-midnight hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-label-md font-label-md">Shift Protocols</span>
        </Link>
        <Link href="/professional/settings" className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-warm-slate hover:text-deep-midnight hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md font-label-md">Settings</span>
        </Link>
        
        {/* CTA 'Go Off-Duty' */}
        <button className="mt-space-xs w-full py-2.5 px-space-md rounded-full bg-surface-container-high hover:bg-rose-bg text-warm-slate hover:text-rose-text text-label-md font-label-md font-semibold transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]">
          <span className="material-symbols-outlined text-base">power_settings_new</span>
          <span>Go Off-Duty</span>
        </button>
      </div>
    </aside>
  );
}
