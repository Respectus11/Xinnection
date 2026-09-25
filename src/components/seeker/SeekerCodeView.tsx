"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";

export function SeekerCodeView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get("c") || "XXXX-XXXX";
  const locale = (params?.locale as string) || "en";
  
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      QRCode.toDataURL(token, {
        width: 260,
        margin: 1,
        color: {
          dark: "#09090B",
          light: "#FAFAFA",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [token]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token).then(() => {
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2000);
      });
    } else {
      const tempInput = document.createElement("input");
      tempInput.value = token;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const handleSaveScreenshot = () => {
    setSaveState("saving");
    try {
      // Create off-screen canvas to draw an elegant recovery card
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 750;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Background
        ctx.fillStyle = "#09090B";
        ctx.fillRect(0, 0, 600, 750);

        // Header Border
        ctx.strokeStyle = "rgba(255, 107, 107, 0.4)";
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 560, 710);

        // Brand Title
        ctx.fillStyle = "#FAFAFA";
        ctx.font = "bold 32px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Xinnection Anonymous Recovery Key", 300, 80);

        ctx.fillStyle = "#A1A1AA";
        ctx.font = "16px sans-serif";
        ctx.fillText("Keep this key private. It is your only access to your thread.", 300, 115);

        // Token Box
        ctx.fillStyle = "#18181B";
        ctx.fillRect(50, 140, 500, 70);
        ctx.fillStyle = "#FF6B6B";
        ctx.font = "bold 28px 'JetBrains Mono', monospace";
        ctx.fillText(token, 300, 185);

        // QR Code
        if (qrDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 175, 240, 250, 250);
            
            // Instructions
            ctx.fillStyle = "#E4E4E7";
            ctx.font = "14px sans-serif";
            ctx.fillText("Scan or enter code at xinnection.org/code", 300, 540);
            ctx.fillStyle = "#71717A";
            ctx.font = "12px monospace";
            ctx.fillText(`Generated: ${new Date().toUTCString()}`, 300, 580);
            ctx.fillText("Zero cookies • Ephemeral storage • 100% Anonymous", 300, 610);

            // Trigger download
            const link = document.createElement("a");
            link.download = `xinnection-key-${token}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
          };
          img.src = qrDataUrl;
          return;
        }
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      console.error("Save image error:", e);
      setSaveState("idle");
    }
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md antialiased min-h-[100dvh] flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container pb-28 relative">
      {/* Mobile Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-canvas-deep/95 backdrop-blur-md px-margin py-space-sm flex items-center justify-between shadow-sm">
        {/* Back Action Button */}
        <button 
          onClick={() => router.back()} 
          aria-label="Go back" 
          className="w-10 h-10 rounded-full bg-elevated-onyx flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-95 transition-all duration-150" 
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {/* Center Screen Title */}
        <h1 className="font-headline-sm text-headline-sm text-starlight-white font-semibold tracking-tight">
          Anonymous Access
        </h1>
        {/* Encrypted Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated-onyx text-muted-silver text-label font-label border border-white/5">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
          <span className="text-[11px] tracking-wide text-starlight-white/90">Zero Logs</span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-md mx-auto px-margin pt-space-md flex flex-col gap-y-space-lg flex-1">
        {/* Section 1: Prominent Success & Token Generation Header */}
        <section className="flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint/15 text-tertiary font-label text-label mb-space-sm border border-mint/20 shadow-sm">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="font-medium tracking-wide">Token Issued & Active</span>
          </div>
          {/* Headline */}
          <h2 className="font-headline-lg text-headline-lg text-starlight-white font-bold tracking-tight mb-space-xs">
            Secure Access Key Generated.
          </h2>
          {/* Subtitle */}
          <p className="font-body-md text-body-md text-muted-silver max-w-xs leading-relaxed">
            Your private key to return to this peer thread anytime, completely anonymously.
          </p>
        </section>

        {/* Section 2: Core Recovery Code & QR Elevated Card */}
        <section className="bg-elevated-onyx rounded-DEFAULT p-space-md shadow-lg border border-white/5 relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Card Internal Header */}
          <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">key</span>
              <span className="font-label text-label text-muted-silver uppercase tracking-wider font-semibold">Anonymous Recovery Code</span>
            </div>
            <button 
              onClick={handleCopy} 
              aria-label="Copy recovery code" 
              className="p-1 rounded-full text-muted-silver hover:text-starlight-white active:scale-90 transition-all duration-150" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>

          {/* Alphanumeric Token Presentation Box */}
          <div className="bg-canvas-deep/80 rounded-DEFAULT p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-space-md border border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-silver text-sm">lock_clock</span>
              <span className="font-mono-data text-headline-sm font-bold text-starlight-white tracking-widest selection:bg-primary-container">
                {token}
              </span>
            </div>
            {/* Tap to Copy Pill Button */}
            <button 
              onClick={handleCopy} 
              className="w-full sm:w-auto px-3 py-1 rounded-full bg-elevated-onyx hover:bg-white/10 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/10 shadow-sm" 
              type="button"
            >
              <span className="material-symbols-outlined text-xs">content_copy</span>
              <span>{copyState === "copied" ? "Copied!" : "Tap to Copy"}</span>
            </button>
          </div>

          {/* High-Contrast Crisp QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative bg-starlight-white p-3 rounded-2xl shadow-md flex items-center justify-center w-52 h-52 transition-transform duration-200 hover:scale-[1.01]">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for anonymous access key ${token}`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-silver">
                  <span className="material-symbols-outlined text-3xl animate-spin">refresh</span>
                  <span className="text-xs font-mono-data">Generating QR...</span>
                </div>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-muted-silver mt-2">Scan from another device to sync thread</p>
          </div>

          {/* Quick Utility Action Buttons Row */}
          <div className="grid grid-cols-2 gap-space-sm mt-space-md">
            <button 
              onClick={handleCopy} 
              className="py-2.5 px-3 rounded-full bg-canvas-deep hover:bg-canvas-deep/60 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/5 cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-base text-primary-container">content_copy</span>
              <span>{copyState === "copied" ? "Copied!" : "Copy Code"}</span>
            </button>
            <button 
              onClick={handleSaveScreenshot}
              className="py-2.5 px-3 rounded-full bg-canvas-deep hover:bg-canvas-deep/60 active:scale-95 text-starlight-white text-label font-label flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/5 cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-base text-secondary">download</span>
              <span>
                {saveState === "saving" ? "Downloading..." : saveState === "saved" ? "Image Saved" : "Save Image"}
              </span>
            </button>
          </div>
        </section>

        {/* Section 3: Empathetic Instructions & Security Notice Card */}
        <section className="bg-elevated-onyx rounded-2xl p-space-md border-l-4 border-peach border-t border-r border-b border-white/5 space-y-space-sm shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-peach text-xl shrink-0 mt-0.5">warning</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-starlight-white text-sm font-semibold">Important Privacy Safeguard</h3>
              <p className="font-body-md text-body-md text-muted-silver text-xs leading-relaxed mt-1">
                Take a screenshot of this page or write this code down. This is the <strong className="text-starlight-white font-medium">ONLY way</strong> to access your thread or read counselor replies. For your absolute anonymity, there is no password reset.
              </p>
            </div>
          </div>
          {/* Bulleted Safety Pillars */}
          <div className="pt-space-xs border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>Zero tracking cookies</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>Ephemeral storage</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-silver text-[11px] font-label">
              <span className="material-symbols-outlined text-mint text-sm">check_circle</span>
              <span>100% anonymous</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Navigation / Primary CTA Container */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-elevated-onyx/95 backdrop-blur-md px-margin py-3.5 shadow-lg flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col items-center gap-1.5">
          <Link href={`/${locale}/thread/${token}`} className="w-full h-12 rounded-full bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-on-primary-container font-headline-sm text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-150">
            <span>I have saved my code, continue to thread</span>
            <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
          </Link>
          {/* Reassuring subtext */}
          <p className="font-body-sm text-body-sm text-muted-silver text-[11px] tracking-wide text-center">
            By continuing, you confirm your access key is safely stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
