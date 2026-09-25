"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MetricsData } from "./LiveMetricsRibbon";

export function DashboardSidebar({ metrics }: { metrics: MetricsData }) {
  const router = useRouter();
  const [isAudioChimeOn, setIsAudioChimeOn] = useState(true);
  const [isProtocolsOpen, setIsProtocolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleGoOffDuty = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/auth");
  };

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
          <Link href="/professional?filter=ESCALATED" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-vibrant-coral">warning</span>
              <span className="text-label-md font-label-md">Escalations</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-rose-bg text-rose-text font-semibold">{metrics.escalations}</span>
          </Link>
          
          {/* My Active Chats */}
          <Link href="/professional?filter=IN_PROGRESS" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined">forum</span>
              <span className="text-label-md font-label-md">My Active Chats</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-surface-container-high text-warm-slate">{metrics.activeChats}</span>
          </Link>
          
          {/* Handoff Log */}
          <Link href="/professional?filter=RESOLVED" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined">swap_horiz</span>
              <span className="text-label-md font-label-md">Handoff Log</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-mono-data font-mono-data bg-surface-container-high text-warm-slate">{metrics.handoffLog}</span>
          </Link>
          
          {/* Supervision & Insights */}
          <Link href="/admin" className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-warm-slate dark:text-tertiary-fixed-dim hover:text-deep-midnight dark:hover:text-surface-container-lowest transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-high cursor-pointer active:scale-[0.99]">
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
        <button 
          onClick={() => setIsAudioChimeOn((prev) => !prev)}
          className="flex items-center justify-between px-space-sm py-1.5 rounded-md bg-surface-container-low/70 hover:bg-surface-container-low transition-colors cursor-pointer w-full text-left"
          type="button"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-warm-slate text-sm">
              {isAudioChimeOn ? "volume_up" : "volume_off"}
            </span>
            <span className="text-mono-data font-mono-data text-warm-slate text-[11px]">Audio Tone Alerts</span>
          </div>
          <span className={`text-mono-data font-mono-data px-2 py-0.5 rounded text-[11px] font-medium ${
            isAudioChimeOn ? "text-mint-text bg-mint-bg" : "text-warm-slate bg-surface-container-high"
          }`}>
            {isAudioChimeOn ? "Chime On" : "Muted"}
          </span>
        </button>
        
        {/* Footer navigation tabs */}
        <button 
          onClick={() => setIsProtocolsOpen(true)}
          className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-warm-slate hover:text-deep-midnight hover:bg-surface-container-low transition-colors text-left w-full cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-label-md font-label-md">Shift Protocols</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-warm-slate hover:text-deep-midnight hover:bg-surface-container-low transition-colors text-left w-full cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md font-label-md">Settings</span>
        </button>
        
        {/* CTA 'Go Off-Duty' */}
        <button 
          onClick={handleGoOffDuty}
          className="mt-space-xs w-full py-2.5 px-space-md rounded-full bg-surface-container-high hover:bg-rose-bg text-warm-slate hover:text-rose-text text-label-md font-label-md font-semibold transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-base">power_settings_new</span>
          <span>Go Off-Duty</span>
        </button>
      </div>

      {/* Shift Protocols Modal */}
      {isProtocolsOpen && (
        <div className="fixed inset-0 z-50 bg-canvas-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-pure-surface border border-surface-container-high rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
              <div className="flex items-center gap-2 text-deep-midnight">
                <span className="material-symbols-outlined text-azure-blue">medical_services</span>
                <h3 className="font-headline-sm font-bold text-lg">Clinical Shift Protocols (Tier 1 & 2)</h3>
              </div>
              <button onClick={() => setIsProtocolsOpen(false)} className="p-1 rounded-full text-warm-slate hover:text-deep-midnight">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-body-sm text-deep-midnight">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <strong className="block text-sm mb-1 text-vibrant-coral">Protocol 1: Imminent Risk Assessment</strong>
                <p className="text-warm-slate text-xs">Verify intent, means, plan, and timeframe. If explicit suicide or self-harm plan is declared, trigger Emergency Broadcast escalation immediately.</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <strong className="block text-sm mb-1 text-azure-blue">Protocol 2: De-escalation & Anchoring</strong>
                <p className="text-warm-slate text-xs">Validate feelings non-judgmentally. Use 4-7-8 breathing macros and invite grounding sensory focus.</p>
              </div>
            </div>
            <button onClick={() => setIsProtocolsOpen(false)} className="mt-5 w-full py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-deep-midnight font-medium text-sm">
              Acknowledged
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-canvas-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-pure-surface border border-surface-container-high rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
              <h3 className="font-headline-sm font-bold text-lg text-deep-midnight">Station Preferences</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full text-warm-slate hover:text-deep-midnight">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div>
                  <span className="font-medium text-deep-midnight block">Tone Alerts</span>
                  <span className="text-xs text-warm-slate">Play audio ping on new high-risk queue items</span>
                </div>
                <button 
                  onClick={() => setIsAudioChimeOn(!isAudioChimeOn)} 
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${isAudioChimeOn ? "bg-azure-blue" : "bg-surface-container-high"}`}
                  type="button"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAudioChimeOn ? "translate-x-4" : ""}`} />
                </button>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="mt-5 w-full py-2.5 rounded-full bg-surface-container-high text-deep-midnight font-medium text-sm">
              Done
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
