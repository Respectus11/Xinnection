"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthLoginView() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<"peer" | "supervisor" | "admin">("peer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; body: string } | null>(null);

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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid credentials or unauthorized terminal access.");
      }
      if (activeRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/professional");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const handleEmergencyExit = () => {
    if (typeof window !== "undefined") {
      window.location.replace("https://www.google.com");
    }
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md min-h-[100dvh] flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden antialiased">
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-headline-sm font-semibold text-starlight-white">Hardware Key & Gateway Support</h3>
            <p className="text-muted-silver text-sm leading-relaxed">
              If your YubiKey hardware token is unregistered or damaged, contact your station supervisor. For test environments, default credentials are pre-seeded in the database.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white text-sm font-medium hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Dialog for Footer Links */}
      {infoModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-headline-sm font-semibold text-starlight-white">{infoModalContent.title}</h3>
            <p className="text-muted-silver text-sm leading-relaxed">{infoModalContent.body}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInfoModalContent(null)}
                className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white text-sm font-medium hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Anchor */}
      <header className="w-full px-4 sm:px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 border-b border-surface-container-high/30 bg-canvas-deep/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link className="flex items-center gap-2.5 group" href="/">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container border border-primary-container/40 group-hover:scale-105 transition-transform duration-150">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="text-headline-md font-headline-md font-bold tracking-tight text-starlight-white">Xinnection</span>
          </Link>
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-label font-label">
            <Link className="text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95" href="/">Sanctuary Mode</Link>
            <div className="text-primary-container font-semibold flex items-center gap-1.5">
              <span>Clinical Gateway</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            </div>
            <button 
              onClick={() => setShowHelpModal(true)} 
              className="text-muted-silver hover:text-starlight-white transition-colors duration-150"
            >
              Support
            </button>
          </nav>
        </div>
        {/* Trailing Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a 
            href="tel:988" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-elevated-onyx/80 border border-surface-container-high/60 text-body-sm font-body-sm text-starlight-white hover:border-muted-silver transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-mint"></span>
            <span>Crisis Line 988</span>
          </a>
          <button 
            onClick={handleEmergencyExit}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-surface-container-high/80 hover:bg-rose/20 text-rose border border-rose/30 text-label font-label transition-colors active:scale-95 duration-150" 
            title="Immediate emergency redirect" 
            type="button"
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Emergency Exit</span>
          </button>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-silver hover:text-starlight-white transition-colors" 
            title="System Help" 
            type="button"
          >
            <span className="material-symbols-outlined text-lg">help</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full pt-16 flex flex-col lg:flex-row min-h-[calc(100vh-70px)]">
        {/* Left Pane: Branding & Atmosphere */}
        <section className="relative w-full lg:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-surface-container-high/30 overflow-hidden bg-canvas-deep">
          <div className="absolute inset-0 pointer-events-none opacity-80" style={{ background: "radial-gradient(circle at 40% 30%, rgba(255, 107, 107, 0.28) 0%, rgba(79, 70, 229, 0.16) 45%, rgba(9, 9, 11, 0) 75%)" }}></div>
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: "radial-gradient(circle at 70% 80%, rgba(79, 70, 229, 0.22) 0%, rgba(219, 39, 119, 0.12) 50%, rgba(9, 9, 11, 0) 80%)" }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-elevated-onyx/90 border border-surface-container-high/50 text-label font-label text-primary-container shadow-sm mb-6 sm:mb-8 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="tracking-wide">Clinical Gateway Triage</span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-starlight-white tracking-tight leading-tight max-w-md">
              Where clinical excellence meets human connection.
            </h1>
            <p className="mt-4 text-body-lg font-body-lg text-muted-silver leading-relaxed max-w-sm">
              Audited real-time crisis escalation protocols, resilient low-latency routing, and zero-knowledge telemetry built for frontline mental health responders.
            </p>

          </div>
          
          <div className="relative z-10 mt-8 lg:mt-0 pt-6 border-t border-surface-container-high/30">
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
                <span className="font-mono-data text-mono-data text-mint font-semibold bg-mint/10 px-2.5 py-1 rounded-md border border-mint/20 text-xs">
                  42 Responders Active
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Right Pane: Clinical Gateway Auth Form */}
        <section className="w-full lg:w-[58%] flex items-center justify-center p-4 sm:p-8 lg:p-14 bg-elevated-onyx/40">
          <div className="w-full max-w-xl bg-elevated-onyx rounded-2xl border border-surface-container-high/50 p-6 sm:p-10 shadow-2xl relative">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label font-label uppercase tracking-widest text-primary font-semibold">Triage Terminal v4.12</span>
                <span className="inline-flex items-center gap-1 text-label font-label text-muted-silver text-xs">
                  <span className="material-symbols-outlined text-sm text-mint">check_circle</span>
                  TLS 1.3 Strict
                </span>
              </div>
              <h2 className="text-headline-lg font-headline-lg text-starlight-white font-bold tracking-tight">Professional & Admin Gateway</h2>
              <p className="text-body-md font-body-md text-muted-silver mt-1">Authenticate credentials to access queue escalation and clinical telemetry.</p>
            </div>
            
            {/* Role Selection */}
            <div className="mb-6 sm:mb-7">
              <label className="block text-label font-label text-starlight-white font-medium mb-3">Select Terminal Context</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Role 1: Peer Responder */}
                <button 
                  onClick={() => setActiveRole("peer")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === "peer" ? "border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container" : "border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40"} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === "peer" ? "text-primary-container" : "text-muted-silver group-hover:text-starlight-white"}`} style={activeRole === "peer" ? { fontVariationSettings: "'FILL' 1" } : {}}>support_agent</span>
                    {activeRole === "peer" ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">Peer Responder</p>
                    <span className={`text-[11px] leading-tight font-mono-data block mt-0.5 ${activeRole === "peer" ? "text-primary-container" : "text-muted-silver"}`}>Tier 1 & 2 Support</span>
                  </div>
                </button>

                {/* Role 2: Clinical Supervisor */}
                <button 
                  onClick={() => setActiveRole("supervisor")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === "supervisor" ? "border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container" : "border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40"} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === "supervisor" ? "text-primary-container" : "text-muted-silver group-hover:text-starlight-white"}`} style={activeRole === "supervisor" ? { fontVariationSettings: "'FILL' 1" } : {}}>psychology</span>
                    {activeRole === "supervisor" ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">Clinical Supervisor</p>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${activeRole === "supervisor" ? "text-primary-container" : "text-muted-silver"}`}>Case Escalation</span>
                  </div>
                </button>

                {/* Role 3: System Admin */}
                <button 
                  onClick={() => setActiveRole("admin")}
                  className={`text-left p-3.5 rounded-xl border ${activeRole === "admin" ? "border-2 border-primary-container bg-surface-container-high/40 hover:border-primary-container" : "border-surface-container-high bg-surface-container-low/60 hover:bg-surface-container-high/30 hover:border-muted-silver/40"} transition-all flex flex-col justify-between relative group`} 
                  type="button"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`material-symbols-outlined text-xl ${activeRole === "admin" ? "text-primary-container" : "text-muted-silver group-hover:text-starlight-white"}`} style={activeRole === "admin" ? { fontVariationSettings: "'FILL' 1" } : {}}>admin_panel_settings</span>
                    {activeRole === "admin" ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-elevated-onyx"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline/50 flex items-center justify-center"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-starlight-white">System Admin</p>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${activeRole === "admin" ? "text-primary-container" : "text-muted-silver"}`}>Enclave & Audits</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Auth Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-label font-label text-muted-silver">Secure Passphrase</label>
                  <button 
                    type="button"
                    onClick={() => setInfoModalContent({
                      title: "Hardware Security Key Recovery",
                      body: "Hardware security keys must be attested through an active Tier 1 supervisor or re-enrolled through the Node Onboarding console (/admin/onboarding)."
                    })}
                    className="text-label font-label text-primary hover:underline hover:text-starlight-white transition-colors"
                  >
                    Forgot security key?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-silver">
                    <span className="material-symbols-outlined text-base">lock</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-canvas-deep border border-surface-container-high text-starlight-white text-body-md font-body-md focus:border-azure-blue focus:ring-1 focus:ring-azure-blue focus:outline-none transition-colors" 
                    placeholder="Enter passphrase" 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-silver hover:text-starlight-white" 
                    type="button"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-base">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              
              {/* MFA Hardware Token / 6-digit indicator */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-label font-label text-muted-silver">MFA Token / Hardware Key</label>
                  <span className="text-label font-label text-[#3B82F6] font-mono-data flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-xs">phonelink_lock</span> FIDO2 Ready
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="7" readOnly />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="3" readOnly />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} type="text" defaultValue="9" readOnly />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                  <input className="h-11 text-center font-mono-data font-semibold text-headline-sm bg-canvas-deep border border-surface-container-high rounded-lg text-starlight-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none" maxLength={1} placeholder="•" type="text" />
                </div>
                <p className="text-body-sm font-body-sm text-muted-silver/80 mt-1.5 flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-xs text-mint">verified</span>
                  Touch hardware YubiKey or provide 6-digit authenticator code
                </p>
              </div>
              
              {/* Shift persistence toggle */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input defaultChecked className="w-4 h-4 rounded border-surface-container-high bg-canvas-deep text-primary-container focus:ring-0 focus:ring-offset-0" type="checkbox" />
                  <span className="text-body-sm font-body-sm text-starlight-white select-none text-xs">Remember terminal for this shift (8h)</span>
                </label>
                <span className="text-[11px] font-mono-data text-muted-silver bg-surface-container-high/40 px-2 py-0.5 rounded border border-surface-container-high">
                  AES-256-GCM
                </span>
              </div>
              
              {/* Primary Submit Button */}
              <div className="pt-4 flex flex-col gap-2">
                {error && (
                  <div className="text-rose text-sm font-label text-center mb-1 bg-rose/10 border border-rose/30 p-2 rounded-lg">
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
              
              <div className="pt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-container-high/60"></div>
                <span className="text-label font-label text-muted-silver text-xs">Looking for peer help?</span>
                <div className="h-px flex-1 bg-surface-container-high/60"></div>
              </div>
              
              <div className="text-center pt-1">
                <Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-container-high/70 hover:border-mint/60 bg-surface-container-low/40 hover:bg-surface-container-high/30 text-muted-silver hover:text-starlight-white transition-all group" href="/">
                  <span className="material-symbols-outlined text-mint text-sm group-hover:scale-110 transition-transform">spa</span>
                  <span className="text-label font-label font-medium text-xs">Access Seeker Portal (Anonymous)</span>
                </Link>
              </div>
              
              <p className="text-center text-[11px] leading-relaxed text-muted-silver/70 pt-2 font-mono-data">
                End-to-End Encrypted Clinical Gateway • Session ephemeral keys purged upon logout
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer Anchor */}
      <footer className="w-full px-6 sm:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-surface-container-high/30 bg-canvas-deep text-muted-silver mt-auto text-xs">
        <div className="flex items-center gap-3">
          <span className="text-headline-sm font-headline-sm font-bold text-starlight-white">Xinnection</span>
          <span className="text-body-sm font-body-sm text-muted-silver/80">© 2024 Xinnection Systems. End-to-end encrypted crisis support network.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-label font-label">
          <button 
            onClick={() => setInfoModalContent({
              title: "Zero-Knowledge Anonymous Protocol",
              body: "Xinnection never records IP addresses, device identifiers, or biometric profiles. Cryptographic key pairs are generated on client devices and destroyed immediately upon session resolution."
            })}
            className="text-muted-silver hover:text-starlight-white transition-colors"
          >
            Anonymous Protocol
          </button>
          <button 
            onClick={() => setInfoModalContent({
              title: "Security Architecture",
              body: "All communications utilize AES-256-GCM envelope encryption with per-session wrapped data keys and Shamir secret sharding."
            })}
            className="text-muted-silver hover:text-starlight-white transition-colors"
          >
            Security Architecture
          </button>
          <button 
            onClick={() => setInfoModalContent({
              title: "Clinical Standards",
              body: "Responders operate under strict trauma-informed care standards, de-escalation protocols, and immediate Tier 1 supervisor paging."
            })}
            className="text-muted-silver hover:text-starlight-white transition-colors"
          >
            Clinical Standards
          </button>
        </div>
      </footer>
    </div>
  );
}
