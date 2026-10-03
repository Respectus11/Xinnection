"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionPayload } from "@/lib/auth";

interface DashShellProps {
  session: SessionPayload;
  children: React.ReactNode;
}

export function DashShell({ session, children }: DashShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/auth";
  };

  const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "X";
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md min-h-[100dvh] flex flex-col md:flex-row antialiased selection:bg-primary-container selection:text-starlight-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-elevated-onyx border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-muted-silver hover:text-starlight-white"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="font-bold text-starlight-white">Xinnection</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-mono-data text-xs font-semibold">
          {getInitials(session.name)}
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-canvas-deep border-r border-white/10 shrink-0 transition-transform duration-200
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 flex flex-col gap-4 flex-1">
          {/* Brand */}
          <Link href="/" className="hidden md:flex items-center gap-3 px-1 py-1 hover:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-elevated-onyx border border-white/10 flex items-center justify-center relative shadow-sm">
              <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-headline-sm font-bold text-starlight-white tracking-wide">Xinnection</span>
              <span className="text-xs text-muted-silver tracking-tight">Clinical Workspace</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {!isAdmin && (
              <Link 
                href="/professional" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === "/professional" || pathname === "/en/professional" || pathname.includes("/professional/case") 
                    ? "bg-surface-container-high text-starlight-white border-l-4 border-mint font-medium" 
                    : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">inbox</span>
                <span>Triage Queue</span>
              </Link>
            )}

            {isAdmin && (
              <Link 
                href="/admin" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === "/admin" || pathname === "/en/admin"
                    ? "bg-surface-container-high text-starlight-white border-l-4 border-mint font-medium" 
                    : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">analytics</span>
                <span>System Operations</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 flex flex-col gap-3 border-t border-white/10 bg-canvas-deep">
          <div className="p-2.5 rounded-xl bg-elevated-onyx border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-mono-data text-xs font-semibold">
                {getInitials(session.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-starlight-white truncate">{session.name}</span>
                <span className="text-[10px] text-mint font-mono-data truncate">{isAdmin ? "Administrator" : "Clinical Responder"}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-silver hover:text-primary-container transition-colors p-1 shrink-0" 
              title="Sign out" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-[100dvh] bg-canvas-deep">
        {children}
      </main>
    </div>
  );
}
