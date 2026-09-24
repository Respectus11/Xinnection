"use client";

import React, { useState } from "react";


export function AdminOnboardingView() {
  const [isAttested, setIsAttested] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateKeyTap = () => {
    if (!isAttested) {
      setIsSimulating(true);
      setTimeout(() => {
        setIsSimulating(false);
        setIsAttested(true);
      }, 800);
    } else {
      setIsAttested(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-starlight-white relative overflow-x-hidden">
      {/* Ambient Background Lighting */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
        }}
      ></div>
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/10 via-emerald-600/5 to-transparent blur-3xl pointer-events-none z-0"></div>
      
      {/* Top Navigation Header */}
      <header className="relative z-10 w-full px-space-lg py-space-sm bg-elevated-onyx/80 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-DEFAULT bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined" data-icon="security" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <span className="text-headline-sm font-headline-sm text-starlight-white tracking-wide block leading-none">Xinnection</span>
              <span className="text-body-sm font-body-sm text-muted-silver">System Control Console</span>
            </div>
          </div>
          <div className="h-4 w-px bg-zinc-800 ml-2 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-mono-data font-mono-data text-muted-silver">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"></span>
            <span>ENCRYPTED PROTOCOL V4.12</span>
          </div>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-muted-silver hover:text-starlight-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]" data-icon="help_outline">help_outline</span>
            <span>Help / Docs</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <span className="text-mono-data font-mono-data text-xs text-muted-silver">NODE:</span>
            <span className="text-mono-data font-mono-data text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">NX-8821</span>
          </div>
        </div>
      </header>

      {/* Main Centered Content Canvas */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-space-md lg:p-space-lg">
        <div className="w-full max-w-3xl bg-elevated-onyx border border-zinc-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
          {/* Top Subtle Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
          
          {/* Top Header & Protocol Tag */}
          <div className="mb-space-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-mono-data font-mono-data mb-space-sm tracking-wider">
              <span className="material-symbols-outlined text-[14px]" data-icon="fingerprint">fingerprint</span>
              FIDO2 / WEBAUTHN ENROLLMENT • PROTOCOL V4.12
            </div>
            <h1 className="text-headline-xl font-headline-xl text-starlight-white tracking-tight">Responder Node Configuration</h1>
            <p className="text-body-md font-body-md text-muted-silver mt-1">Establish cryptographic identity and verify hardware attestation.</p>
          </div>

          {/* 3-Step Progress Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-space-lg p-2 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            {/* Step 1: Completed */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900/60 border border-mint/30">
              <div className="w-7 h-7 rounded-full bg-mint/20 text-mint flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-body-sm font-body-sm font-medium text-starlight-white block truncate">1. Identity Verification</span>
                <span className="text-mono-data font-mono-data text-[11px] text-mint block">Verified LCSW-09</span>
              </div>
            </div>
            {/* Step 2: Active */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/50 shadow-sm relative">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/30">
                <span className="material-symbols-outlined text-[16px]" data-icon="key">key</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-body-sm font-body-sm font-medium text-starlight-white block truncate">2. Hardware Key</span>
                <span className="text-mono-data font-mono-data text-[11px] text-blue-400 block font-medium">In Progress</span>
              </div>
            </div>
            {/* Step 3: Pending */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-transparent border border-transparent opacity-60">
              <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]" data-icon="lock">lock</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-body-sm font-body-sm text-muted-silver block truncate">3. Cryptographic Quorum</span>
                <span className="text-mono-data font-mono-data text-[11px] text-zinc-500 block">Pending</span>
              </div>
            </div>
          </div>

          {/* Step 2 Content Section: Hardware Key Attestation */}
          <div className="space-y-space-md">
            {/* Interactive Visual Card */}
            <div className="relative p-6 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
              <div className="relative flex-shrink-0">
                <div 
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isAttested 
                      ? "bg-emerald-950/50 border border-mint text-mint shadow-lg shadow-emerald-900/30" 
                      : "bg-blue-950/40 border border-blue-500/30 text-blue-400 animate-[haloPulse_3s_ease-in-out_infinite]"
                  }`}
                  style={!isAttested ? {
                    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4), 0 0 20px 2px rgba(5, 150, 105, 0.2)'
                  } : {}}
                >
                  <span className="material-symbols-outlined text-[44px]" style={isAttested ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 1" }}>
                    {isAttested ? 'check_circle' : 'security'}
                  </span>
                </div>
                {!isAttested && (
                  <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-zinc-700 text-blue-400 text-[10px] font-mono-data px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    <span>USB-C / NFC</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-headline-sm font-headline-sm text-starlight-white leading-tight">Insert hardware token to begin FIDO2 enrollment.</h3>
                <p className="text-body-md font-body-md text-muted-silver">Touch the gold contact on your YubiKey or security key when the prompt flashes.</p>
                {/* Dynamic Status Bar */}
                <div className="pt-2">
                  <div className={`rounded-lg px-3.5 py-2.5 flex items-center justify-between text-mono-data font-mono-data text-xs text-zinc-300 transition-colors ${
                    isAttested 
                      ? 'bg-emerald-950/30 border border-mint/50' 
                      : 'bg-zinc-900/90 border border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-peach animate-ping' : isAttested ? 'bg-mint' : 'bg-blue-400 animate-pulse'}`}></span>
                      <span>
                        {isSimulating 
                          ? "Security Key detected. Verifying physical touch..." 
                          : isAttested 
                            ? <><span className="text-mint font-semibold">Attestation Verified:</span> YubiKey 5C NFC (FIDO2 Level 2)</>
                            : "Waiting for device presence..."}
                      </span>
                    </div>
                    {!isAttested && !isSimulating && <span className="text-zinc-500 text-[11px]">TIMEOUT: 120s</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Input & Config */}
            <div className="space-y-4 pt-1">
              {/* Floating / Framed Label Input */}
              <div className="space-y-1.5">
                <label className="text-label font-label text-muted-silver flex items-center justify-between" htmlFor="node-alias">
                  <span>Node Alias (optional)</span>
                  <span className="text-mono-data font-mono-data text-[11px] text-zinc-500">Public Audit Label</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-starlight-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-body-md font-body-md transition-all duration-150" id="node-alias" placeholder="e.g., Station-04-Primary-YubiKey" type="text" />
                </div>
                <p className="text-mono-data font-mono-data text-xs text-zinc-500">Used in Merkle audit logs without revealing personal identity.</p>
              </div>

              {/* Security Checkboxes */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input defaultChecked className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-primary-container focus:ring-primary-container focus:ring-offset-zinc-900" type="checkbox" />
                  <div className="text-body-md font-body-md text-starlight-white leading-snug">
                    <span>Require biometric touch confirmation for every session handoff</span>
                    <span className="block text-body-sm font-body-sm text-muted-silver">Enforces physical user presence validation for every crisis routing triage.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-primary-container focus:ring-primary-container focus:ring-offset-zinc-900" type="checkbox" />
                  <div className="text-body-md font-body-md text-starlight-white leading-snug">
                    <span>Register backup security key</span>
                    <span className="block text-body-sm font-body-sm text-muted-silver">Enrolls a redundant token immediately to prevent responder lockouts.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Enclave Info Bar */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <p className="text-body-sm font-body-sm text-muted-silver leading-relaxed">
                <strong className="text-starlight-white font-medium">Zero-Knowledge Attestation:</strong> Hardware public keys are pinned locally to your enclave. Private keys never leave the physical token.
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-space-lg pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-body-md font-body-md text-muted-silver hover:text-starlight-white hover:bg-zinc-800/60 transition-colors flex items-center justify-center gap-1.5 order-2 sm:order-1" type="button">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Identity</span>
            </button>
            <div className="w-full sm:w-auto flex items-center gap-3 order-1 sm:order-2">
              {/* Simulate Key Tap Micro-Interaction */}
              <button 
                className="px-3.5 py-2.5 rounded-lg text-mono-data font-mono-data text-xs text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all active:scale-95 flex items-center gap-1.5" 
                onClick={simulateKeyTap} 
                type="button"
                disabled={isSimulating}
              >
                <span className="material-symbols-outlined text-[16px]">{isAttested ? 'refresh' : 'touch_app'}</span>
                <span>{isAttested ? 'Reset Simulation' : 'Simulate Key Tap'}</span>
              </button>
              {/* Primary CTA Button */}
              <button className="flex-1 sm:flex-initial px-8 py-3 rounded-full bg-primary-container text-white font-headline-sm text-body-md shadow-lg shadow-coral/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 font-medium" type="button">
                <span>Attest & Continue</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer Note */}
      <footer className="relative z-10 py-4 px-space-md text-center border-t border-zinc-900 bg-canvas-deep">
        <p className="text-mono-data font-mono-data text-xs text-muted-silver">
          Xinnection Zero-Knowledge Network • FIPS 140-3 Level 3 Attestation Supported • Node ID: #NX-8821-ENCLAVE
        </p>
      </footer>
    </div>
  );
}
