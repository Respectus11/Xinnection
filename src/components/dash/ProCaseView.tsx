/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Thread, Message } from "@prisma/client";

export function ProCaseView({ threadId }: { threadId: string }) {
  const [activeTab, setActiveTab] = useState<"reply" | "note">("reply");
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);;
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/threads/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          setThread(data);
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchThread();
    const interval = setInterval(fetchThread, 5000);
    return () => clearInterval(interval);
  }, [threadId]);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setContent("");
        // Optimistic refresh handled by next poll or we can force it
        const newThreadRes = await fetch(`/api/threads/${threadId}`);
        if (newThreadRes.ok) {
          const data = await newThreadRes.json();
          setThread(data);
          setMessages(data.messages || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md text-body-md antialiased h-[100dvh] overflow-hidden flex flex-col select-none">
      {/* TOP APP BAR */}
      <header className="w-full h-14 pl-64 pr-space-lg flex items-center justify-between z-30 sticky top-0 bg-elevated-onyx border-b border-outline-variant/30 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-headline-sm font-headline-sm font-semibold text-starlight-white">Xinnection Triage Cockpit</span>
          </div>
          <div className="relative w-64 ml-4">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-silver text-sm">search</span>
            <input className="w-full bg-canvas-deep border border-outline-variant/40 rounded-full pl-8 pr-3 py-1 text-body-sm font-body-sm text-starlight-white placeholder:text-muted-silver focus:outline-none focus:border-secondary-container" placeholder="Search case, token, NLP flag..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Trailing Action Icons */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 relative" type="button">
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container"></span>
            </button>
            <button className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150" type="button">
              <span className="material-symbols-outlined text-lg">wifi_tethering</span>
            </button>
            <button className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150" type="button">
              <span className="material-symbols-outlined text-lg">help_outline</span>
            </button>
          </div>
          <div className="h-5 w-px bg-outline-variant/40 mx-1"></div>
          {/* Primary & Secondary Cockpit Actions */}
          <button className="px-3 py-1 rounded-full border border-outline-variant/50 text-starlight-white hover:bg-surface-container-high transition-colors font-label text-label active:scale-95 duration-150" type="button">
            Resolve Session
          </button>
          <button className="px-3 py-1 rounded-full bg-primary-container text-starlight-white hover:opacity-90 transition-opacity font-label text-label active:scale-95 duration-150 flex items-center gap-1.5 shadow-sm" type="button">
            <span className="material-symbols-outlined text-sm">emergency_share</span>
            <span>Escalate Case</span>
          </button>
          {/* Active Clinician Profile */}
          <div className="flex items-center gap-2 pl-2">
            <img className="w-7 h-7 rounded-full object-cover border border-primary-container/40" alt="Clinician portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASYeg4ePEu-NDXZmsaloUjHkAP13VHPF1KfQhDIU981naqTinKLVoBQU6O5D7i91nszCoZuJIil1ghxUroe7n5Ds7Y4I3LFS_Kb2_WN6hOu2mIEjWy6p2Z10iXbscZNxynBG2lyEPyI-lqO1o9buvebe10_lNCEhFIJiSdioHybPvyhvNMVUDuYkipiJ69VB_INEMZ0gDKGROMiPiWQSGx0T9Ic5pomJVTc3x-O6XMosgrCdFc37Uro0gnM2Fl54F6ctiSM0PwiOw" />
          </div>
        </div>
      </header>

      {/* WORKSPACE WRAPPER */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* PANE 1: SideNavBar */}
        <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col p-space-md bg-elevated-onyx border-r border-outline-variant/30 justify-between shrink-0 shadow-none">
          {/* Sidebar Header & Clinician Identity */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/20 hover:opacity-90">
              <div className="w-8 h-8 rounded-DEFAULT bg-primary-container/20 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>enhanced_encryption</span>
              </div>
              <div>
                <div className="text-headline-sm font-headline-sm font-bold text-starlight-white tracking-wide">Xinnection</div>
                <div className="text-label font-label text-muted-silver">Cockpit Station 04</div>
              </div>
            </Link>
            {/* Responder Profile Badge */}
            <div className="my-4 p-2.5 bg-canvas-deep/80 rounded-DEFAULT border border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img className="w-9 h-9 rounded-full object-cover border border-tertiary" alt="Responder Badge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdrbDVA6YZBgvkVLdT9oTXax0kFNCvAUyqERAFZnOfy8m0aii_RQ_MSr-kP9f7UcWAM07b2jzBWm4pRF7oDvPDWD8xjFrxKoqQ8Z3OsB-jRdm-MW3PUkvGA1kTqMns9nJi0Z5wx0riH_aOpzjC6YlXhiW6aPpOG0vORIivjg70QDlhIxwTIX-7uFN296i1gPe5NtN9UwAo30yaxQEei1vNMdXevIcWRqYmrq8QxS9lPzx6ejtMMLxiFCYMNZ8oVoCGquvObo8QNrk" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-mint rounded-full ring-2 ring-elevated-onyx"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label font-label font-semibold text-starlight-white truncate">Dr. Aris Thorne, LCSW</div>
                  <div className="text-body-sm font-body-sm text-muted-silver flex items-center gap-1">
                    <span>On-Shift</span>
                    <span className="w-1 h-1 rounded-full bg-muted-silver"></span>
                    <span className="text-tertiary font-mono-data text-[11px]">Tier 2 Lead</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <Link href="/professional" className="flex items-center justify-between px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">inbox</span>
                  <span className="text-label font-label">Queue</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-primary font-mono-data text-[11px] font-semibold">42</span>
              </Link>
              <Link href="#" className="flex items-center justify-between px-space-md py-space-sm rounded-DEFAULT bg-surface-container-highest text-primary-container font-semibold border-l-4 border-primary-container">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
                  <span className="text-label font-label">Active Cases</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono-data text-[11px] font-bold">3</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal">
                <span className="material-symbols-outlined text-lg">history</span>
                <span className="text-label font-label">History</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal">
                <span className="material-symbols-outlined text-lg">medical_services</span>
                <span className="text-label font-label">Shift Protocols</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal">
                <span className="material-symbols-outlined text-lg">settings</span>
                <span className="text-label font-label">Settings</span>
              </Link>
            </nav>
            {/* Secondary Section */}
            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-1">
              <div className="px-space-md text-[10px] font-mono-data tracking-wider uppercase text-muted-silver/60">Shift Preferences</div>
              <div className="flex items-center justify-between px-space-md py-2">
                <span className="text-label font-label text-muted-silver flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">volume_up</span>
                  Audio Chimes
                </span>
                <button className="w-8 h-4 bg-mint/40 rounded-full relative p-0.5 cursor-pointer flex items-center justify-end" type="button">
                  <span className="w-3 h-3 bg-tertiary-fixed rounded-full shadow-sm"></span>
                </button>
              </div>
            </div>
          </div>
          {/* Sidebar Footer */}
          <div className="space-y-3 pt-3 border-t border-outline-variant/20">
            <button className="w-full py-2.5 px-3 rounded-full bg-error-container/40 border border-error/50 hover:bg-error-container/60 text-error font-label text-label flex items-center justify-center gap-2 transition-all active:scale-[0.98]" type="button">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>Emergency Handoff</span>
            </button>
            <div className="flex items-center justify-between px-2 text-muted-silver">
              <Link href="#" className="flex items-center gap-1.5 text-body-sm font-body-sm hover:text-starlight-white">
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Knowledge Base</span>
              </Link>
              <Link href="#" className="flex items-center gap-1.5 text-body-sm font-body-sm hover:text-starlight-white">
                <span className="material-symbols-outlined text-base">headset_mic</span>
                <span>Support</span>
              </Link>
            </div>
            <button className="w-full py-1.5 rounded-DEFAULT text-body-sm font-body-sm text-muted-silver hover:bg-surface-container-high hover:text-starlight-white flex items-center justify-center gap-1.5" type="button">
              <span className="material-symbols-outlined text-sm">power_settings_new</span>
              <span>Go Off-Duty</span>
            </button>
          </div>
        </aside>

        {/* MAIN TWO-PANE COCKPIT CONTENT AREA */}
        <main className="flex-1 flex ml-64 h-full overflow-hidden">
          {/* PANE 2: Central Conversation & Transcript Workspace */}
          <section className="flex-1 flex flex-col h-full bg-canvas-deep border-r border-outline-variant/30 min-w-0">
            {/* Transcript Header Bar */}
            <div className="h-14 px-5 bg-elevated-onyx/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-canvas-deep/70 px-2.5 py-1 rounded-DEFAULT border border-outline-variant/30">
                  <span className="text-label font-label text-muted-silver">Thread ID:</span>
                  <span className="font-mono-data text-mono-data text-starlight-white font-semibold">{thread?.id.split("-")[0].toUpperCase() || "..."}</span>
                </div>
                {/* Status Indicator Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint/20 border border-mint/40 text-tertiary-fixed text-label font-label">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                  <span>Active • Tier 2 Peer Responder Assigned</span>
                </div>
                {/* Elapsed Duration Timer */}
                <div className="flex items-center gap-1 font-mono-data text-mono-data text-muted-silver">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span>Elapsed: 14m 28s</span>
                </div>
              </div>
              {/* Tags & Incident Actions */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-mint/20 text-tertiary-fixed font-label text-label border border-mint/40">
                  {thread?.categoryId || "Unknown"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label text-label border border-secondary-container/40">
                  Zero-Logs Encrypted
                </span>
                <div className="h-4 w-px bg-outline-variant/30 mx-1"></div>
                <button className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors" title="Flag Incident" type="button">
                  <span className="material-symbols-outlined text-lg">flag</span>
                </button>
                <button className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors" title="Print Transcript" type="button">
                  <span className="material-symbols-outlined text-lg">print</span>
                </button>
              </div>
            </div>

            {/* Ephemeral Live Chat Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* System Security Banner */}
              <div className="mx-auto max-w-2xl py-2 px-4 rounded-DEFAULT bg-surface-container-low/60 border border-outline-variant/30 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-silver text-label font-label">
                  <span className="material-symbols-outlined text-mint text-sm">lock</span>
                  <span>Anonymous Session Established • Memory ephemeral buffer active with instant shredding on close • AES-256</span>
                </div>
              </div>

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.senderRole === 'SEEKER' ? 'items-start' : 'items-end ml-auto'} max-w-xl`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {msg.senderRole === 'SEEKER' ? (
                      <>
                        <span className="text-label font-label text-muted-silver font-semibold">Anonymous Seeker</span>
                        <span className="font-mono-data text-[11px] text-muted-silver">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono-data text-[11px] text-muted-silver">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="text-label font-label text-secondary font-semibold">You (Responder)</span>
                      </>
                    )}
                  </div>
                  <div className={`${msg.senderRole === 'SEEKER' ? 'bg-elevated-onyx border-outline-variant/30 text-starlight-white' : 'bg-lavender/20 border-lavender/40 text-starlight-white'} border rounded-DEFAULT p-3.5 shadow-sm leading-relaxed`}>
                    {msg.ciphertext}
                  </div>
                </div>
              ))}



              {/* Real-Time Typing Indicator */}
              <div className="flex items-center gap-2 px-2 py-1 text-label font-label text-muted-silver">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="italic text-body-sm font-body-sm">Seeker is typing...</span>
              </div>
            </div>

            {/* Dual-Tab Bottom Composer */}
            <div className="bg-elevated-onyx border-t border-outline-variant/30 p-3 shrink-0">
              {/* Mode Tabs */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("reply")}
                    className={`px-3 py-1 rounded-full text-label font-label transition-colors ${activeTab === 'reply' ? 'bg-surface-container-highest text-primary-container font-semibold border border-primary-container/40' : 'text-muted-silver hover:text-starlight-white hover:bg-surface-container-high'}`}
                    type="button"
                  >
                    Direct Anonymous Reply
                  </button>
                  <button 
                    onClick={() => setActiveTab("note")}
                    className={`px-3 py-1 rounded-full text-label font-label transition-colors ${activeTab === 'note' ? 'bg-surface-container-highest text-primary-container font-semibold border border-primary-container/40' : 'text-muted-silver hover:text-starlight-white hover:bg-surface-container-high'}`}
                    type="button"
                  >
                    Internal Clinical Note (Confidential)
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-muted-silver text-label font-label">
                  <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                  <span className="text-body-sm font-body-sm">Safe Buffer Active</span>
                </div>
              </div>
              
              {/* Clinical Macro Quick-Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
                <span className="text-label font-label text-muted-silver whitespace-nowrap mr-1">Insert Protocol:</span>
                <button className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" type="button">
                  Grounding Prompt
                </button>
                <button className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" type="button">
                  Safety Validation
                </button>
                <button className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" type="button">
                  Breathing Cadence
                </button>
                <button className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" type="button">
                  CBT Reframing
                </button>
                <button className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-secondary hover:bg-surface-container-high border border-secondary/40 whitespace-nowrap transition-colors flex items-center gap-1" type="button">
                  <span className="material-symbols-outlined text-xs">attach_file</span>
                  Attach Safe Resource
                </button>
              </div>
              
              {/* Input Composer Form */}
              <div className="relative bg-canvas-deep rounded-DEFAULT border border-outline-variant/40 focus-within:border-secondary-container transition-colors">
                <textarea 
                  className="w-full bg-transparent p-3 text-body-md font-body-md text-starlight-white placeholder:text-muted-silver focus:outline-none resize-none" 
                  placeholder="Type an empathic, validating response or use protocols above..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={3}
                  disabled={isSending}
                ></textarea>
                <div className="flex items-center justify-between px-3 py-2 border-t border-outline-variant/20 bg-canvas-deep/40 rounded-b-DEFAULT">
                  <div className="flex items-center gap-2 text-muted-silver text-body-sm font-body-sm">
                    <span className="font-mono-data text-xs">178 / 500 chars</span>
                    <span>•</span>
                    <span className="text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sentiment_satisfied</span> Non-judgmental tone detected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container" type="button">
                      <span className="material-symbols-outlined text-base">mic</span>
                    </button>
                    <button onClick={handleSend} disabled={isSending || !content.trim()} className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white disabled:opacity-50 hover:opacity-90 font-label text-label flex items-center gap-1.5 shadow-sm active:scale-95 transition-all" type="button">
                      <span>{isSending ? "Sending..." : "Send"}</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PANE 3: Right Actionable Intelligence & Inspector Pane */}
          <aside className="w-80 bg-elevated-onyx flex flex-col h-full overflow-y-auto border-l border-outline-variant/30 shrink-0 p-4 space-y-4 custom-scrollbar">
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">analytics</span>
                <span className="text-headline-sm font-headline-sm font-semibold text-starlight-white">Telemetry & Triage</span>
              </div>
              <span className="font-mono-data text-[11px] text-tertiary bg-mint/10 border border-mint/30 px-2 py-0.5 rounded-full">REALTIME</span>
            </div>

            {/* 1. Thread Overview Card */}
            <div className="bg-canvas-deep rounded-DEFAULT p-3.5 border border-outline-variant/20 space-y-2.5">
              <div className="text-label font-label text-muted-silver uppercase tracking-wider font-semibold">Session Profile</div>
              <div className="grid grid-cols-2 gap-2 text-body-sm font-body-sm">
                <div>
                  <div className="text-muted-silver">Seeker Token</div>
                  <div className="font-mono-data text-starlight-white font-medium">XN-442-991</div>
                </div>
                <div>
                  <div className="text-muted-silver">Client IP</div>
                  <div className="font-mono-data text-mint font-medium">Tor-Shielded</div>
                </div>
                <div>
                  <div className="text-muted-silver">Queue Wait Time</div>
                  <div className="font-mono-data text-starlight-white">01m 14s</div>
                </div>
                <div>
                  <div className="text-muted-silver">Response Latency</div>
                  <div className="font-mono-data text-starlight-white">02m 04s</div>
                </div>
              </div>
            </div>

            {/* 2. Real-Time Risk & NLP Telemetry Card */}
            <div className="bg-canvas-deep rounded-DEFAULT p-3.5 border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-label font-label text-muted-silver uppercase tracking-wider font-semibold">NLP Risk Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-mint/20 text-tertiary-fixed font-mono-data text-[11px] font-semibold">Tier 4</span>
              </div>
              {/* Risk Level Indicator Pill */}
              <div className="p-2.5 rounded-DEFAULT bg-surface-container-low border border-mint/30 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-mint text-xl">verified</span>
                <div>
                  <div className="text-label font-label font-semibold text-starlight-white">Mild / Moderate Panic</div>
                  <div className="text-body-sm font-body-sm text-tertiary-fixed">Non-Crisis • Somatic Load</div>
                </div>
              </div>
              {/* Engine Sub-Metrics */}
              <div className="space-y-1.5 text-body-sm font-body-sm">
                <div className="flex justify-between items-center text-muted-silver">
                  <span>Active Red Flags</span>
                  <span className="font-mono-data text-mint font-semibold">0 Flags Detected</span>
                </div>
                <div className="flex justify-between items-center text-muted-silver">
                  <span>Suicidal Ideation Probability</span>
                  <span className="font-mono-data text-starlight-white">0.0%</span>
                </div>
                <div className="flex justify-between items-center text-muted-silver">
                  <span>Self-Harm Indicators</span>
                  <span className="font-mono-data text-starlight-white">0.0%</span>
                </div>
                <div className="flex justify-between items-center text-muted-silver">
                  <span>Psychosis / Disorientation</span>
                  <span className="font-mono-data text-starlight-white">0.0%</span>
                </div>
              </div>
              {/* Cognitive Distortion Tags */}
              <div className="pt-2 border-t border-outline-variant/20">
                <div className="text-[11px] font-mono-data text-muted-silver mb-1.5">DETECTED COGNITIVE DISTORTIONS</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-peach/20 text-peach border border-peach/30 text-label font-label">
                    Catastrophizing
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-muted-silver border border-outline-variant/30 text-label font-label">
                    Overgeneralization
                  </span>
                </div>
              </div>
            </div>

            {/* 3. One-Click Clinical Snippets & Guided Protocols */}
            <div className="bg-canvas-deep rounded-DEFAULT p-3.5 border border-outline-variant/20 space-y-2.5">
              <div className="text-label font-label text-muted-silver uppercase tracking-wider font-semibold">Clinical Protocols</div>
              <div className="space-y-1.5">
                <button className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" type="button">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">air</span>
                    <span className="text-body-sm font-body-sm text-starlight-white group-hover:text-primary">4-7-8 Breathing Guidance</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-muted-silver">arrow_forward</span>
                </button>
                <button className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" type="button">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-mint text-sm">anchor</span>
                    <span className="text-body-sm font-body-sm text-starlight-white group-hover:text-primary">De-escalation & Anchor</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-muted-silver">arrow_forward</span>
                </button>
                <button className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" type="button">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm">menu_book</span>
                    <span className="text-body-sm font-body-sm text-starlight-white group-hover:text-primary">Resource: Work Stress Guide</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-muted-silver">open_in_new</span>
                </button>
              </div>
            </div>

            {/* 4. Primary Escalation & Triage Controls */}
            <div className="space-y-2 pt-2 mt-auto">
              <div className="text-[11px] font-mono-data text-muted-silver mb-1">TRIAGE DISPOSITION ACTIONS</div>
              {/* Escalate to Tier 1 Crisis */}
              <button className="w-full py-2.5 px-3 rounded-full bg-rose hover:bg-rose/90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]" type="button">
                <span className="material-symbols-outlined text-base">emergency</span>
                <span>Escalate to Tier 1 Crisis</span>
              </button>
              {/* Initiate Peer Handoff */}
              <button className="w-full py-2.5 px-3 rounded-full bg-secondary-container hover:bg-secondary-container/90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]" type="button">
                <span className="material-symbols-outlined text-base">sync_alt</span>
                <span>Initiate Peer Handoff</span>
              </button>
              {/* Mark Resolved & Shred Ephemeral Cache */}
              <button className="w-full py-2.5 px-3 rounded-full bg-primary-container hover:opacity-90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]" type="button">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                <span>Mark Resolved & Shred Cache</span>
              </button>
            </div>
          </aside>
        </main>
      </div>
      
      {/* Scrollbar styles to match design */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090B;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #251818;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #403130;
        }
      `}} />
    </div>
  );
}
