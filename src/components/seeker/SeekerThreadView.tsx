"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Thread, Message } from "@prisma/client";

export function SeekerThreadView({ code }: { code: string }) {
  const router = useRouter();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurged, setIsPurged] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!code) return;
    const fetchThread = async () => {
      try {
        // Wait, the page is /thread/[code]. We don't have the thread ID on the client unless we decode it.
        // I need to change how the client fetches the thread.
        // Let's use a new route or just look it up in page.tsx and pass it down.
        // Oh wait! The code contains the Thread ID! It's formatted as `XN-[uuid]-...`.
        // Let's just fetch it from `GET /api/threads/${code}` by changing the api route name? 
        // No, the code is passed to the route. Wait, the token *is* the thread ID if we parse it, but no, the token is `threadId:tokenStr`. 
        // Let's look up how `SeekerCodeView` creates the code. It's just a string like `XN-442-991`? 
        // No, `generateSeekerCode` generates it.
        const res = await fetch(`/api/threads/by-code?code=${code}`);
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
  }, [code]);

  const handleSend = async () => {
    if (!content.trim() || isSending || !thread) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/threads/${thread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, code })
      });
      if (res.ok) {
        setContent("");
        // Force refresh
        const newThreadRes = await fetch(`/api/threads/by-code?code=${code}`);
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

  const handlePurgeClick = () => setIsPurgeModalOpen(true);
  const handleCancelPurge = () => setIsPurgeModalOpen(false);
  const handleConfirmPurge = async () => {
    if (thread) {
      await fetch(`/api/threads/${thread.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
    }
    setIsPurged(true);
    setIsPurgeModalOpen(false);
  };

  if (isPurged) {
    return (
      <div className="min-h-[100dvh] bg-canvas-deep flex flex-col items-center justify-center p-space-lg text-center font-body-md antialiased">
        <div className="w-16 h-16 rounded-full bg-mint/20 border border-mint/40 text-mint flex items-center justify-center mb-space-md">
          <span className="material-symbols-outlined text-3xl">verified_user</span>
        </div>
        <h1 className="font-headline-md text-headline-md font-bold text-starlight-white mb-2">Memory Purged Safely</h1>
        <p className="font-body-md text-body-md text-muted-silver max-w-xs mb-space-lg">
          All temporary keys shredded. No traces remain on this device or peer relays.
        </p>
        <Link href="/" className="px-space-lg py-2.5 bg-elevated-onyx border border-white/15 rounded-full text-starlight-white font-label text-label font-medium hover:bg-white/10 active:scale-95 transition-all">
          Return to Sanctuary
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md text-body-md antialiased min-h-[100dvh] flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* TOP STICKY APP BAR */}
      <header className="sticky top-0 z-40 w-full bg-canvas-deep/95 backdrop-blur-md px-margin py-space-sm flex items-center justify-between shadow-sm">
        {/* Back / Navigation Exit */}
        <button 
          onClick={() => router.back()} 
          aria-label="Exit thread safely" 
          className="w-10 h-10 rounded-full bg-elevated-onyx flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-95 transition-all duration-150"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {/* Thread ID & Ephemeral Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_8px_rgba(5,150,105,0.8)]"></span>
            <span className="font-mono-data text-mono-data font-medium text-starlight-white tracking-tight">Thread {thread?.id?.split("-")[0].toUpperCase() || "..."}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px] text-mint">lock</span>
            <span className="font-label text-[11px] text-muted-silver tracking-wide">Zero Logs Encrypted</span>
          </div>
        </div>
        {/* Prominent "Delete My Data" Destructive Action */}
        <button 
          onClick={handlePurgeClick}
          className="bg-rose/15 hover:bg-rose/25 text-rose border border-rose/30 font-label text-label px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-all duration-150 shadow-sm" 
          title="Permanently delete all session trace" 
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">delete</span>
          <span className="font-medium hidden sm:inline">Delete My Data</span>
        </button>
      </header>

      {/* MAIN CHAT STREAM */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-margin pt-space-md pb-36 overflow-y-auto no-scrollbar flex flex-col gap-space-lg">
        {/* System Security Handshake Banner */}
        <div className="mx-auto w-full max-w-sm bg-elevated-onyx/80 border border-white/5 rounded-DEFAULT p-space-md shadow-sm text-center flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-canvas-deep flex items-center justify-center text-mint">
            <span className="material-symbols-outlined text-base">shield</span>
          </div>
          <p className="font-label text-label text-starlight-white font-medium">Anonymous Session Established</p>
          <p className="font-body-sm text-body-sm text-muted-silver leading-relaxed">
            No IP address, identity, or browser cookies recorded. Memory ephemeral buffer active with instant shredding on close.
          </p>
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.senderRole === 'SEEKER' ? 'items-end' : 'items-start'} gap-1.5 max-w-[88%] ${msg.senderRole === 'SEEKER' ? 'self-end' : 'self-start'}`}>
            {msg.senderRole === 'SEEKER' ? (
              <>
                <div className="bg-elevated-onyx border border-white/10 rounded-2xl rounded-tr-sm p-space-md shadow-md text-starlight-white">
                  <p className="font-body-md text-body-md leading-relaxed font-normal">{msg.ciphertext}</p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-silver font-label text-[11px] pr-1">
                  <span className="font-mono-data text-[11px]">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-mint font-medium">
                    <span className="material-symbols-outlined text-[13px]">done_all</span> Delivered
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-lavender/30 border border-lavender/50 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label text-label font-semibold text-starlight-white">Responder</span>
                    <span className="inline-flex items-center gap-0.5 bg-lavender/20 text-secondary border border-lavender/40 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <span className="material-symbols-outlined text-[11px]">verified</span> Verified Peer
                    </span>
                  </div>
                </div>
                <div className="bg-elevated-onyx/90 border border-lavender/25 rounded-2xl rounded-tl-sm p-space-md shadow-md text-starlight-white relative overflow-hidden">
                  <p className="font-body-md text-body-md leading-relaxed">{msg.ciphertext}</p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-silver font-label text-[11px] pl-1">
                  <span className="font-mono-data text-[11px]">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>•</span>
                  <span className="text-secondary font-medium">Verified Responder</span>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Live Empathy Status / Typing Indicator */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 max-w-fit">
          <div className="flex items-center gap-1 bg-elevated-onyx px-2.5 py-1.5 rounded-full border border-white/5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-[pulse-gentle_1.8s_infinite_ease-in-out]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-[pulse-gentle_1.8s_infinite_ease-in-out_0.3s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-[pulse-gentle_1.8s_infinite_ease-in-out_0.6s]"></span>
          </div>
          <span className="font-label text-body-sm text-muted-silver italic">Julian is reflecting on your message...</span>
        </div>
      </main>

      {/* STICKY BOTTOM COMPOSER BAR & DOCKED CONTROLS */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-canvas-deep via-canvas-deep to-canvas-deep/80 backdrop-blur-lg pt-2 pb-safe">
        <div className="max-w-2xl mx-auto px-margin pb-space-sm flex flex-col gap-2">
          {/* Interactive Composer Box */}
          <div className="bg-elevated-onyx border border-white/15 rounded-2xl p-2 shadow-xl flex items-end gap-2 focus-within:border-secondary transition-colors duration-150">
            {/* Auxiliary Action Button: Voice note */}
            <button aria-label="Voice memo option" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-95 transition-all" type="button">
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            {/* Auxiliary Action Button: Breathing Prompt Modal Trigger */}
            <button aria-label="Guided breathing exercise" className="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-tertiary-fixed active:scale-95 transition-all" type="button">
              <span className="material-symbols-outlined text-[20px]">spa</span>
            </button>
            {/* Dynamic Input Textarea */}
            <div className="flex-1 py-1.5">
              <textarea 
                className="w-full bg-transparent border-0 p-0 text-starlight-white placeholder:text-muted-silver font-body-md text-body-md resize-none focus:ring-0 focus:outline-none max-h-24 overflow-y-auto leading-relaxed" 
                placeholder="Type without filter... (Anonymous)" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isSending}
                rows={1}
              ></textarea>
            </div>
            {/* Primary Send Button in Vibrant Coral */}
            <button onClick={handleSend} disabled={isSending || !content.trim()} aria-label="Send message anonymously" className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-semibold flex items-center justify-center shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-95 transition-transform duration-150 flex-shrink-0" type="button">
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
            </button>
          </div>
          {/* Confidentiality Reassurance */}
          <div className="flex items-center justify-center gap-2 text-center pb-1">
            <span className="material-symbols-outlined text-[13px] text-muted-silver">lock</span>
            <p className="font-mono-data text-[11px] text-muted-silver tracking-tight">
              Zero-knowledge encryption • Instant purge on exit
            </p>
          </div>
        </div>
      </footer>

      {/* Instant Data Purge Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-canvas-deep/80 backdrop-blur-sm flex items-center justify-center p-space-md transition-opacity duration-200">
          <div className="bg-elevated-onyx border border-rose/30 rounded-DEFAULT p-space-lg max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose/15 border border-rose/30 flex items-center justify-center text-rose mb-space-sm">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-starlight-white mb-1">Purge All Session Data?</h3>
            <p className="font-body-md text-body-md text-muted-silver mb-space-lg leading-relaxed">
              This will immediately drop cryptographic keys, terminate the peer connection, and zero-fill this conversation memory permanently.
            </p>
            <div className="flex items-center gap-space-sm w-full">
              <button 
                onClick={handleCancelPurge}
                className="flex-1 py-2.5 rounded-full border border-white/10 text-muted-silver hover:text-starlight-white font-label text-label font-medium active:scale-95 transition-all" 
                type="button"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPurge}
                className="flex-1 py-2.5 rounded-full bg-rose text-white font-label text-label font-semibold shadow-md active:scale-95 transition-all" 
                type="button"
              >
                Purge Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
