"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthLoginView() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<"peer" | "supervisor" | "admin">("peer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          portal: activeRole === "admin" ? "admin" : "professional" 
        }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      // If it's a supervisor/admin, they might route to /admin instead.
      if (activeRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/professional");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md min-h-[100dvh] flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden antialiased">
      {/* Top Navigation Anchor */}
      <header className="w-full px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 border-b border-surface-container-high/30 bg-canvas-deep/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2.5 group" href="/">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container border border-primary-container/40 group-hover:scale-105 transition-transform duration-150">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="text-headline-md font-headline-md font-bold tracking-tight text-starlight-white">Xinnection</span>
          </Link>
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-label font-label">
            <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95" href="/">Sanctuary Mode</Link>
            <Link className="text-primary-container font-semibold active:scale-95 flex items-center gap-1.5" href="#">
              <span>Clinical Gateway</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            </Link>
            <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95" href="#">Support</Link>
          </nav>
        </div>
        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          <Link className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-elevated-onyx/80 border border-surface-container-high/60 text-body-sm font-body-sm text-starlight-white hover:border-muted-silver transition-colors" href="#">
            <span className="w-2 h-2 rounded-full bg-mint"></span>
            <span>Crisis Line 988</span>
          </Link>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-high/80 hover:bg-error/20 text-error border border-error/30 text-label font-label transition-colors active:scale-95 duration-150" title="Emergency wipe session" type="button">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Emergency Exit</span>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-silver hover:text-starlight-white transition-colors" title="System Help" type="button">
            <span className="material-symbols-outlined text-lg">help</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout (Desktop Offset Asymmetric Split) */}
      <main className="flex-1 w-full pt-16 flex flex-col lg:flex-row min-h-[calc(100vh-70px)]">
        {/* Left Pane: Branding & Atmosphere (~42% desktop) */}
        <section className="relative w-full lg:w-[42%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-surface-container-high/30 overflow-hidden bg-canvas-deep">
          {/* Glow Gradients (using inline styles to mimic CSS classes for simplicity here) */}
          <div className="absolute inset-0 pointer-events-none opacity-80" style={{ background: "radial-gradient(circle at 40% 30%, rgba(255, 107, 107, 0.28) 0%, rgba(79, 70, 229, 0.16) 45%, rgba(9, 9, 11, 0) 75%)" }}></div>
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: "radial-gradient(circle at 70% 80%, rgba(79, 70, 229, 0.22) 0%, rgba(219, 39, 119, 0.12) 50%, rgba(9, 9, 11, 0) 80%)" }}></div>
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"></div>
          
          {/* Top Branding Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-elevated-onyx/90 border border-surface-container-high/50 text-label font-label text-primary-container shadow-sm mb-8 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="tracking-wide">Clinical Gateway Triage</span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-starlight-white tracking-tight leading-tight max-w-md">
              Where clinical excellence meets human connection.
            </h1>
            <p className="mt-4 text-body-lg font-body-lg text-muted-silver leading-relaxed max-w-sm">
              Audited real-time crisis escalation protocols, resilient low-latency routing, and zero-knowledge telemetry built for frontline mental health responders.
            </p>
            {/* Feature Pills Chips */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint/15 text-mint border border-mint/30 text-label font-label">
                <span className="material-symbols-outlined text-xs">lock</span>
                HIPAA & SOC-2 Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender/20 text-secondary border border-lavender/40 text-label font-label">
                <span className="material-symbols-outlined text-xs">vpn_key</span>
                Zero-Knowledge Enclave
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-peach/15 text-peach border border-peach/30 text-label font-label">
                <span className="material-symbols-outlined text-xs">speed</span>
                Real-time Telemetry
              </span>
            </div>
          </div>
          
          {/* Left Bottom Status Card */}
          <div className="relative z-10 mt-12 lg:mt-0 pt-8 border-t border-surface-container-high/30">
            <div className="bg-elevated-onyx/80 backdrop-blur-md p-4 rounded-xl border border-surface-container-high/40 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-mint"></span>
                  <span className="absolute w-3 h-3 rounded-full bg-mint animate-ping opacity-75"></span>
                </div>
                <div>
                  <p className="text-label font-label text-starlight-white font-medium">Network Status: Normal</p>
                  <p className="text-body-sm font-body-sm text-muted-silver">Encrypted Shards Sync Active</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono-data text-mono-data text-mint font-semibold bg-mint/10 px-2.5 py-1 rounded-md border border-mint/20">
                  42 Responders Active
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Right Pane: Clinical Gateway Auth Form (~58% desktop) */}
        <section className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-elevated-onyx/40">
          <div className="w-full max-w-xl bg-elevated-onyx rounded-2xl border border-surface-container-high/50 p-6 sm:p-10 shadow-2xl relative">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label font-label uppercase tracking-widest text-primary font-semibold">Triage Terminal v4.12</span>
                <span className="inline-flex items-center gap-1 text-label font-label text-muted-silver">
                  <span className="material-symbols-outlined text-sm text-mint">check_circle</span>
                  TLS 1.3 Strict
                </span>
              </div>
              <h2 className="text-headline-lg font-headline-lg text-starlight-white font-bold tracking-tight">Professional & Admin Gateway</h2>
              <p className="text-body-md font-body-md text-muted-silver mt-1">Authenticate credentials to access queue escalation and clinical telemetry.</p>
            </div>
            
            {/* Role Selection */}
            <div className="mb-7">
              <label className="block text-label font-label text-starlight-white font-medium mb-3">Select Terminal Context</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Role 1: Peer Responder */}
                <button 
                  onClick={() => setActiveRole("peer")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === 'peer' ? 'border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container' : 'border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40'} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === 'peer' ? 'text-primary-container' : 'text-muted-silver group-hover:text-starlight-white'}`} style={activeRole === 'peer' ? { fontVariationSettings: "'FILL' 1" } : {}}>support_agent</span>
                    {activeRole === 'peer' ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">Peer Responder</p>
                    <span className={`text-[11px] leading-tight font-mono-data block mt-0.5 ${activeRole === 'peer' ? 'text-primary-container' : 'text-muted-silver'}`}>Tier 1 & 2 Support</span>
                  </div>
                </button>

                {/* Role 2: Clinical Supervisor */}
                <button 
                  onClick={() => setActiveRole("supervisor")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === 'supervisor' ? 'border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container' : 'border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40'} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === 'supervisor' ? 'text-primary-container' : 'text-muted-silver group-hover:text-starlight-white'}`} style={activeRole === 'supervisor' ? { fontVariationSettings: "'FILL' 1" } : {}}>psychology</span>
                    {activeRole === 'supervisor' ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">Clinical Supervisor</p>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${activeRole === 'supervisor' ? 'text-primary-container' : 'text-muted-silver'}`}>Case Escalation</span>
                  </div>
                </button>

                {/* Role 3: System Admin */}
                <button 
                  onClick={() => setActiveRole("admin")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === 'admin' ? 'border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container' : 'border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40'} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === 'admin' ? 'text-primary-container' : 'text-muted-silver group-hover:text-starlight-white'}`} style={activeRole === 'admin' ? { fontVariationSettings: "'FILL' 1" } : {}}>admin_panel_settings</span>
                    {activeRole === 'admin' ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">System Admin</p>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${activeRole === 'admin' ? 'text-primary-container' : 'text-muted-silver'}`}>Enclave & Audits</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Auth Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email Input */}
              <div>
                <label className="block text-label font-label text-muted-silver mb-1.5">Work Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-silver">
                    <span className="material-symbols-outlined text-base">mail</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-deep border border-surface-container-high text-starlight-white text-body-md font-body-md placeholder:text-muted-silver/50 focus:border-azure-blue focus:ring-1 focus:ring-azure-blue focus:outline-none transition-colors" 
                    placeholder="responder@crisis.xinnection.org" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-label font-label text-muted-silver">Secure Passphrase</label>
                  <Link className="text-label font-label text-primary hover:underline hover:text-starlight-white transition-colors" href="#">Forgot security key?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-silver">
                    <span className="material-symbols-outlined text-base">lock</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-canvas-deep border border-surface-container-high text-starlight-white text-body-md font-body-md focus:border-azure-blue focus:ring-1 focus:ring-azure-blue focus:outline-none transition-colors tracking-widest" 
                    placeholder="Enter passphrase" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-silver hover:text-starlight-white" type="button">
                    <span className="material-symbols-outlined text-base">visibility</span>
                  </button>
                </div>
              </div>
              
              {/* MFA Hardware Token / 6-digit box */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-label font-label text-muted-silver">MFA Token / Hardware Key</label>
                  <span className="text-label font-label text-[#3B82F6] font-mono-data flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">phonelink_lock</span> FIDO2 Ready
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="7" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="3" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="9" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                </div>
                <p className="text-body-sm font-body-sm text-muted-silver/80 mt-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-mint">verified</span>
                  Touch hardware YubiKey or provide 6-digit authenticator code
                </p>
              </div>
              
              {/* Shift persistence toggle */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input defaultChecked className="w-4 h-4 rounded border-surface-container-high bg-canvas-deep text-primary-container focus:ring-0 focus:ring-offset-0" type="checkbox" />
                  <span className="text-body-sm font-body-sm text-starlight-white select-none">Remember terminal for this shift (8h)</span>
                </label>
                <span className="text-[11px] font-mono-data text-muted-silver bg-surface-container-high/40 px-2 py-0.5 rounded border border-surface-container-high">
                  AES-256-GCM
                </span>
              </div>
              
              {/* Primary Submit Button */}
              <div className="pt-4 flex flex-col gap-2">
                {error && (
                  <div className="text-error text-label font-label text-center mb-1">
                    {error}
                  </div>
                )}
                <button 
                  className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary-container/90 text-starlight-white font-headline-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,107,107,0.35)] hover:shadow-[0_6px_28px_rgba(255,107,107,0.45)] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Authenticating..." : "Secure Login"}</span>
                  {!isLoading && <span className="material-symbols-outlined text-base">arrow_forward</span>}
                </button>
              </div>
              
              {/* Divider */}
              <div className="pt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-container-high/60"></div>
                <span className="text-label font-label text-muted-silver">Looking for peer help?</span>
                <div className="h-px flex-1 bg-surface-container-high/60"></div>
              </div>
              
              {/* Seeker Portal Alternative */}
              <div className="text-center pt-1">
                <Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-container-high/70 hover:border-mint/60 bg-surface-container-low/40 hover:bg-surface-container-high/30 text-muted-silver hover:text-starlight-white transition-all group" href="/">
                  <span className="material-symbols-outlined text-mint text-sm group-hover:scale-110 transition-transform">spa</span>
                  <span className="text-label font-label font-medium">Access Seeker Portal (Anonymous)</span>
                </Link>
              </div>
              
              {/* Security Footnote */}
              <p className="text-center text-[11px] leading-relaxed text-muted-silver/70 pt-2 font-mono-data">
                End-to-End Encrypted Clinical Gateway • Session ephemeral keys purged upon logout
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer Anchor */}
      <footer className="w-full px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-surface-container-high/30 bg-canvas-deep text-muted-silver mt-auto">
        <div className="flex items-center gap-3">
          <span className="text-headline-sm font-headline-sm font-bold text-starlight-white">Xinnection</span>
          <span className="text-body-sm font-body-sm text-muted-silver/80">© 2024 Xinnection Systems. End-to-end encrypted crisis network. HIPAA & SOC2 Compliant.</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-label font-label">
          <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150" href="#">Anonymous Protocol</Link>
          <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150" href="#">Security Architecture</Link>
          <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150" href="#">Clinical Standards</Link>
          <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150" href="#">Crisis Triage Terms</Link>
        </div>
      </footer>
    </div>
  );
}
