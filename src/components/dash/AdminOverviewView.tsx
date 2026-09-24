"use client";

import React from "react";
import Link from "next/link";

export function AdminOverviewView() {
  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen overflow-x-hidden antialiased flex selection:bg-primary-container selection:text-starlight-white">
      {/* ========================================================= */}
      {/* SHARED COMPONENT: SideNavBar (Fixed 260px / w-64 desktop) */}
      {/* ========================================================= */}
      <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-canvas-deep border-r border-white/10 z-40 select-none">
        {/* Top & Primary Navigation Stack */}
        <div className="p-space-md flex flex-col gap-space-md">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-space-xs py-space-xs">
            <div className="w-10 h-10 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex items-center justify-center relative shadow-sm">
              <span className="material-symbols-outlined text-primary-container text-2xl" data-icon="security" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-headline-sm font-headline-sm text-starlight-white tracking-wide">Xinnection</span>
              </div>
              <span className="text-body-sm font-body-sm text-muted-silver tracking-tight">System Control Console</span>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {/* Active Tab: Network Health */}
            <Link className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT bg-surface-container-high text-primary font-headline-sm hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99] border-l-4 border-mint" href="#">
              <span className="material-symbols-outlined text-mint text-xl" data-icon="monitor_heart">monitor_heart</span>
              <span className="text-starlight-white font-headline-sm text-sm">Network Health</span>
            </Link>
            {/* Audit Logs */}
            <Link className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]" href="#">
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="receipt_long">receipt_long</span>
              <span className="font-body-md text-sm">Audit Logs</span>
            </Link>
            {/* Responder Roster */}
            <Link className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]" href="#">
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="badge">badge</span>
              <span className="font-body-md text-sm">Responder Roster</span>
            </Link>
            {/* Key Rotations */}
            <Link className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]" href="#">
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="vpn_key">vpn_key</span>
              <span className="font-body-md text-sm">Key Rotations</span>
            </Link>
            {/* Threat Intel */}
            <Link className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]" href="#">
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="security">security</span>
              <span className="font-body-md text-sm">Threat Intel</span>
            </Link>
          </nav>
          
          {/* Quick Operational Utility Panel */}
          <div className="mt-4 p-3 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-body-sm font-label">
              <span className="text-muted-silver uppercase tracking-wider text-[11px]">Shift Protocol</span>
              <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30 font-mono-data text-[10px] font-semibold">SYNCHRONIZED</span>
            </div>
            <p className="text-body-sm text-on-surface-variant text-[11px] leading-relaxed">
              Zero-Log Buffer shredding verified on all nodes. Next scheduled scrub in 18m.
            </p>
            <button className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-DEFAULT bg-surface-container border border-peach/40 text-peach hover:bg-peach hover:text-starlight-white transition-all text-xs font-mono-data font-medium" type="button">
              <span className="material-symbols-outlined text-sm" data-icon="delete_forever">delete_forever</span>
              <span>Emergency Key Shredder</span>
            </button>
          </div>
        </div>
        
        {/* Bottom Footer Links & Operator Identity Profile */}
        <div className="p-space-md flex flex-col gap-3 border-t border-white/10 bg-canvas-deep">
          {/* Footer Nav Tabs */}
          <div className="flex flex-col gap-1">
            <Link className="flex items-center gap-space-sm px-space-md py-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container hover:text-starlight-white transition-colors duration-150" href="#">
              <span className="material-symbols-outlined text-lg" data-icon="tune">tune</span>
              <span className="text-body-sm">Diagnostics</span>
            </Link>
            <Link className="flex items-center gap-space-sm px-space-md py-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container hover:text-starlight-white transition-colors duration-150" href="#">
              <span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
              <span className="text-body-sm">Settings</span>
            </Link>
          </div>
          {/* Verified Operator Profile Badge */}
          <div className="p-2.5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 border border-secondary/40 flex items-center justify-center text-secondary font-mono-data text-xs font-semibold">
                U09
              </div>
              <div className="flex flex-col">
                <span className="text-body-sm font-label text-starlight-white leading-tight font-medium">Admin SecOps // U09</span>
                <div className="flex items-center gap-1 text-[10px] text-mint font-mono-data">
                  <span className="material-symbols-outlined text-[12px]" data-icon="verified_user">verified_user</span>
                  <span>YubiKey FIDO2</span>
                </div>
              </div>
            </div>
            <button className="text-muted-silver hover:text-primary-container transition-colors p-1" title="Disconnect session" type="button">
              <span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
            </button>
          </div>
          {/* CTA Emergency Lock */}
          <button className="w-full flex items-center justify-center gap-2 py-2 px-space-md rounded-DEFAULT bg-primary-container text-starlight-white font-headline-sm text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md" type="button">
            <span className="material-symbols-outlined text-base" data-icon="lock">lock</span>
            <span>Emergency Lock</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN WORKSPACE & CENTRAL COCKPIT AREA                     */}
      {/* ========================================================= */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col bg-canvas-deep">
        {/* Top Cockpit Header Bar */}
        <header className="sticky top-0 z-30 bg-elevated-onyx/90 backdrop-blur-md px-space-xl py-space-md border-b border-white/10 flex justify-between items-center w-full">
          {/* Breadcrumb & Search */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono-data text-muted-silver">
                <span>Admin</span>
                <span>/</span>
                <span>Telemetry</span>
                <span>/</span>
                <span className="text-primary-fixed">Global Overview</span>
              </div>
              <h1 className="text-headline-md font-headline-md text-starlight-white tracking-tight mt-0.5">
                System Control & Telemetry
              </h1>
            </div>
            {/* Global Status Pill Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/10 border border-mint/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
              </span>
              <span className="text-xs font-mono-data font-medium text-mint tracking-tight">Status: All Systems Nominal</span>
            </div>
          </div>
          
          {/* Actions & Ingress Stream */}
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative hidden xl:block w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-silver text-sm" data-icon="search">search</span>
              <input className="w-full bg-surface-container-lowest border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-muted-silver/60 focus:outline-none focus:ring-1 focus:ring-secondary font-mono-data" placeholder="Search hash, node UUID..." type="text" />
            </div>
            {/* Secondary Action */}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-secondary text-secondary hover:bg-secondary/10 transition-colors text-xs font-body-md font-medium active:scale-95" type="button">
              <span className="material-symbols-outlined text-sm" data-icon="autorenew">autorenew</span>
              <span>Force Key Rotation</span>
            </button>
            {/* Primary Action */}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-starlight-white hover:bg-primary-container/90 transition-all text-xs font-body-md font-semibold shadow-sm active:scale-95" type="button">
              <span className="material-symbols-outlined text-sm" data-icon="gpp_bad">gpp_bad</span>
              <span>Emergency Lockdown</span>
            </button>
            {/* Trailing Indicators */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
              <button className="p-2 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors relative" title="Active Incidents" type="button">
                <span className="material-symbols-outlined text-lg" data-icon="notifications_active">notifications_active</span>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-peach"></span>
              </button>
              <button className="p-2 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors" title="DNS Grid" type="button">
                <span className="material-symbols-outlined text-lg" data-icon="dns">dns</span>
              </button>
              <button className="p-2 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors" title="Terminal Access" type="button">
                <span className="material-symbols-outlined text-lg" data-icon="terminal">terminal</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cockpit Scrollable Content Canvas */}
        <div className="p-space-xl flex flex-col gap-space-lg">
          {/* ======================================================= */}
          {/* ROW 1: High-Level Cockpit Metric Cards (4 Columns)     */}
          {/* ======================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Metric 1 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Encrypted Sessions (24h)</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint/15 text-mint border border-mint/20 text-xs font-mono-data font-semibold">
                  <span className="material-symbols-outlined text-[13px]" data-icon="trending_up">trending_up</span>
                  <span>+14.2%</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">4,821</span>
                <div className="h-6 w-20 flex items-end gap-1">
                  <span className="w-1.5 h-2 bg-mint/40 rounded-t-sm"></span>
                  <span className="w-1.5 h-3 bg-mint/60 rounded-t-sm"></span>
                  <span className="w-1.5 h-4 bg-mint/50 rounded-t-sm"></span>
                  <span className="w-1.5 h-3.5 bg-mint/70 rounded-t-sm"></span>
                  <span className="w-1.5 h-5 bg-mint/80 rounded-t-sm"></span>
                  <span className="w-1.5 h-6 bg-mint rounded-t-sm shadow-[0_0_8px_rgba(5,150,105,0.6)]"></span>
                </div>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint"></span>
                <span>Multi-hop onion routing active</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Responder Utilization</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-mono-data">OPTIMAL</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">78%</span>
                <div className="w-24 bg-surface-container rounded-full h-2 overflow-hidden flex">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center justify-between">
                <span>18 of 23 Nodes Active</span>
                <span className="font-mono-data text-secondary">5 Standby</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Avg Queue Latency</span>
                <span className="text-xs font-mono-data text-mint font-medium px-2 py-0.5 rounded-full bg-mint/10 border border-mint/20">Target &lt; 2m</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">1m 04s</span>
                <span className="material-symbols-outlined text-mint text-2xl" data-icon="speed">speed</span>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-mint" data-icon="check_circle">check_circle</span>
                <span>Zero congestion spikes in buffer</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Ephemeral Shards Purged</span>
                <span className="material-symbols-outlined text-rose text-lg" data-icon="auto_delete">auto_delete</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">12,490</span>
                <span className="text-xs font-mono-data text-rose font-medium">Auto-Tear</span>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-tertiary" data-icon="verified">verified</span>
                <span className="truncate">Zero-Knowledge Guarantee: 100% Verified</span>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* ROW 2: Middle Section (Asymmetric Grid 7/12 & 5/12)     */}
          {/* ======================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
            {/* Left: Global Relay Nodes & Ephemeral Mesh (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between z-10">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Global Relay Nodes & Ephemeral Mesh</h2>
                  <p className="text-body-sm text-muted-silver mt-0.5">Real-time telemetry across cross-region decentralized proxies</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 font-mono-data text-xs text-starlight-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-mint"></span>
                    <span>4 Active</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-peach/30 font-mono-data text-xs text-peach flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-peach"></span>
                    <span>1 Syncing</span>
                  </span>
                </div>
              </div>

              {/* Stylized Dark Mesh Interactive Network Map Canvas */}
              <div className="my-6 h-64 w-full relative bg-surface-container-lowest/60 rounded-DEFAULT border border-white/5 overflow-hidden flex items-center justify-center">
                {/* Global Grid Lines Matrix Pattern */}
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#FAFAFA 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                {/* Stylized Minimal World Map SVG Mesh Curves */}
                <svg className="absolute inset-0 w-full h-full stroke-white/10 fill-none" preserveAspectRatio="none" viewBox="0 0 700 280">
                  <path d="M 120,60 Q 180,50 240,90 T 320,130 T 400,80 T 520,70 T 630,110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" strokeWidth="1.5"></path>
                  <path d="M 140,160 Q 220,170 300,200 T 480,210 T 600,190" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" strokeWidth="1.5"></path>
                  <path d="M 130,95 Q 260,30 360,85" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                  <path d="M 360,85 Q 480,40 580,105" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                  <path d="M 130,95 Q 220,70 330,75" stroke="rgba(234, 88, 12, 0.5)" strokeDasharray="3 3" strokeWidth="1.5"></path>
                  <path d="M 360,85 Q 310,180 230,220" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                </svg>

                {/* Nodes */}
                {/* Node 1 */}
                <div className="absolute left-[18%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: '2.8s' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    US-West (OR) <span className="text-mint font-semibold">22ms</span>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="absolute left-[47%] top-[27%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-peach/30 animate-ping" style={{ animationDuration: '2.8s' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-peach border-2 border-canvas-deep shadow-[0_0_10px_#EA580C]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-peach/50 text-[10px] font-mono-data text-starlight-white shadow flex items-center gap-1">
                    <span>EU-West (LON)</span>
                    <span className="text-peach font-semibold animate-pulse">Re-keying 94%</span>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="absolute left-[52%] top-[31%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: '2.8s' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    EU-Central (FRA) <span className="text-mint font-semibold">14ms</span>
                  </div>
                </div>

                {/* Node 4 */}
                <div className="absolute left-[83%] top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: '2.8s' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    AP-North (HND) <span className="text-mint font-semibold">48ms</span>
                  </div>
                </div>

                {/* Node 5 */}
                <div className="absolute left-[33%] top-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: '2.8s' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    SA-East (GRU) <span className="text-mint font-semibold">61ms</span>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Micro Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono-data">
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Total Node Throughput</span>
                  <span className="text-sm font-semibold text-starlight-white mt-0.5">8.42 Gbps / burst</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Mesh Packet Dispersion</span>
                  <span className="text-sm font-semibold text-mint mt-0.5">99.98% Non-Correlated</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Dynamic Re-route Lag</span>
                  <span className="text-sm font-semibold text-secondary mt-0.5">&lt; 180μs automated</span>
                </div>
              </div>
            </div>

            {/* Right: Real-time Cryptographic Health & Rotations (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Cryptographic Health</h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 border border-secondary/30 text-secondary text-xs font-mono-data">AES-256-GCM</span>
                </div>
                <p className="text-body-sm text-muted-silver mt-0.5">Automated Shamir Sharding & Onion Ingress Ledger</p>

                {/* Key Lifespan Progress Gauge */}
                <div className="mt-5 p-4 rounded-DEFAULT bg-surface-container-lowest border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-body-md text-starlight-white font-medium">Ephemeral Root Key Lifespan</span>
                    <span className="font-mono-data text-peach font-semibold">04m : 12s remaining</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary via-tertiary to-peach h-full rounded-full transition-all duration-300" style={{ width: '68%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono-data text-muted-silver mt-0.5">
                    <span>Cycle #9812-B</span>
                    <span>Auto-Re-key at 00m : 00s</span>
                  </div>
                </div>

                {/* Shamir Secret Sharing Breakdown Card */}
                <div className="mt-4 p-4 rounded-DEFAULT bg-surface-container-lowest border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-mint text-base" data-icon="vpn_key">vpn_key</span>
                      <span className="text-xs font-headline-sm text-starlight-white">Shamir Shard Threshold (5-of-9)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-mint/20 text-mint text-[11px] font-mono-data font-semibold">QUORUM HEALTHY</span>
                  </div>
                  {/* Shard visual matrix pills */}
                  <div className="grid grid-cols-9 gap-1.5 mt-1">
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node US-W">S1</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node EU-C">S2</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node AP-N">S3</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node SA-E">S4</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node CA-C">S5</div>
                    <div className="h-6 rounded bg-peach/20 border border-peach/50 flex items-center justify-center font-mono-data text-[10px] text-peach font-bold" title="London Re-key">S6</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S7</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S8</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S9</div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-mono-data leading-tight">
                    Quorum requirement met. 5 valid cryptographic fragments currently holding decryption bridge.
                  </p>
                </div>
              </div>
              
              {/* Ingress Protocol Bar */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono-data">
                <span className="text-muted-silver">Tor Ingress Bandwidth</span>
                <div className="flex items-center gap-2">
                  <span className="text-secondary font-semibold">1,489 pkts/sec</span>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* ROW 3: Recent Audit Logs & Incident Ledger             */}
          {/* ======================================================= */}
          <section className="p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col gap-4">
            {/* Table Header & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Recent Audit Logs & Incident Ledger</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container border border-white/10 text-muted-silver font-mono-data text-xs">1,204 records</span>
                </div>
                <p className="text-body-sm text-muted-silver mt-0.5">High-fidelity cryptographic trace logs. Zero persistent PII stored.</p>
              </div>
              {/* Category Filter Tabs & Fast Search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 rounded-DEFAULT bg-surface-container-lowest border border-white/5 text-xs font-body-md">
                  <button className="px-3 py-1 rounded bg-surface-container-high text-starlight-white font-medium shadow-sm" type="button">All Events</button>
                  <button className="px-3 py-1 rounded text-muted-silver hover:text-starlight-white transition-colors" type="button">Security</button>
                  <button className="px-3 py-1 rounded text-muted-silver hover:text-starlight-white transition-colors" type="button">Shards</button>
                  <button className="px-3 py-1 rounded text-muted-silver hover:text-starlight-white transition-colors" type="button">Rotations</button>
                </div>
                <button className="p-2 rounded-DEFAULT bg-surface-container border border-white/10 text-muted-silver hover:text-starlight-white transition-colors" title="Export Ledger" type="button">
                  <span className="material-symbols-outlined text-lg" data-icon="download">download</span>
                </button>
              </div>
            </div>

            {/* High Density Professional Data Table (8pt density) */}
            <div className="overflow-x-auto rounded-DEFAULT border border-white/5 bg-surface-container-lowest/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-container/60 text-muted-silver text-xs font-label">
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Timestamp (UTC)</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Event Type</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Initiator Hash / UUID</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Routing Protocol</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Ledger Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-data text-xs">
                  {/* Record 1 */}
                  <tr className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 text-starlight-white whitespace-nowrap">2024-10-24 14:32:08</td>
                    <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
                      <span>Zero-Log Buffer Shred</span>
                    </td>
                    <td className="py-3 px-4 text-muted-silver">anon-node-8891 // SHA256</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">Tor Ingress // Onion-v3</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-mint/20 text-mint border border-mint/30">
                        Success / Purged
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-secondary text-[11px] transition-all" type="button">
                        Inspect Hash
                      </button>
                    </td>
                  </tr>
                  {/* Record 2 */}
                  <tr className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 text-starlight-white whitespace-nowrap">2024-10-24 14:31:45</td>
                    <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-peach"></span>
                      <span>Key Rotation (EU-West)</span>
                    </td>
                    <td className="py-3 px-4 text-muted-silver">sys-mesh-lon-02</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">WireGuard // Direct Peer</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/20 text-secondary border border-secondary/30">
                        In Progress (94%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-secondary text-[11px] transition-all" type="button">
                        Inspect Hash
                      </button>
                    </td>
                  </tr>
                  {/* Record 3 */}
                  <tr className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 text-starlight-white whitespace-nowrap">2024-10-24 14:30:19</td>
                    <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose"></span>
                      <span>High-Risk Escalation Handshake</span>
                    </td>
                    <td className="py-3 px-4 text-rose">ingress-edge-4410 // REJECT</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">IPv6 Unknown Relay</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose/20 text-rose border border-rose/30">
                        Blocked / Rate-Limited
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-primary-container text-[11px] transition-all" type="button">
                        Inspect Hash
                      </button>
                    </td>
                  </tr>
                  {/* Record 4 */}
                  <tr className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 text-starlight-white whitespace-nowrap">2024-10-24 14:28:50</td>
                    <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
                      <span>Admin MFA Challenge</span>
                    </td>
                    <td className="py-3 px-4 text-muted-silver">sys-secops-09 // FIDO2</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">Internal Hardware Bus</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-peach/20 text-peach border border-peach/30">
                        Audited
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-secondary text-[11px] transition-all" type="button">
                        Inspect Hash
                      </button>
                    </td>
                  </tr>
                  {/* Record 5 */}
                  <tr className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 text-starlight-white whitespace-nowrap">2024-10-24 14:26:12</td>
                    <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
                      <span>Node Drop Recovered</span>
                    </td>
                    <td className="py-3 px-4 text-muted-silver">node-ap-north-01</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">BGP Multi-Path failover</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-mint/20 text-mint border border-mint/30">
                        Success / Purged
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-secondary text-[11px] transition-all" type="button">
                        Inspect Hash
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer Pagination & Ledger Integrity Hash */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-silver gap-2 pt-1 font-mono-data">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-mint" data-icon="lock_clock">lock_clock</span>
                <span>Ledger Merkle Root: 0x9f7b...e4a1</span>
                <span className="text-mint font-semibold">[VERIFIED IMMUTABLE]</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Showing 5 of 1,204</span>
                <div className="flex gap-1 ml-2">
                  <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-starlight-white disabled:opacity-30" type="button">Prev</button>
                  <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-starlight-white" type="button">Next</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
