"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Thread, Message } from "@prisma/client";

export function SeekerThreadView({ code }: { code: string }) {
  const router = useRouter();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurged, setIsPurged] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Real voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentlyPlayingIdx, setCurrentlyPlayingIdx] = useState<number | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!code) return;
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/threads/by-code?code=${encodeURIComponent(code)}`);
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
    const interval = setInterval(fetchThread, 4000);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText ?? content;
    if (!textToSend.trim() || isSending) return;
    setIsSending(true);

    try {
      let currentThread = thread;
      if (!currentThread?.id && code) {
        const fetchRes = await fetch(`/api/threads/by-code?code=${encodeURIComponent(code)}`);
        if (fetchRes.ok) {
          currentThread = await fetchRes.json();
          setThread(currentThread);
        }
      }

      if (!currentThread?.id) {
        console.error("No active thread available to post message");
        return;
      }

      const res = await fetch(`/api/threads/${currentThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend, code })
      });
      if (res.ok) {
        setContent("");
        const newThreadRes = await fetch(`/api/threads/by-code?code=${encodeURIComponent(code)}`);
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

  // Voice recording logic with immediate UI activation
  const startRecording = () => {
    // 1. Immediately activate recording state
    setIsRecording(true);
    setLiveTranscript("");
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // 2. Start timer immediately
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // 3. Acquire mic without blocking UI
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          try {
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            mr.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };
            mr.start(250);
          } catch (e) {
            console.warn("MediaRecorder start failed:", e);
          }
        })
        .catch((err) => {
          console.warn("Microphone access prompt or device error:", err);
        });
    }

    // 4. Start Web Speech API transcription in parallel if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text) setLiveTranscript(text);
        };
        recognition.onerror = (e: any) => {
          console.warn("SpeechRecognition error:", e);
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.warn("SpeechRecognition start error:", e);
      }
    }
  };

  const stopAudioStreams = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const cancelRecording = () => {
    stopAudioStreams();
    setIsRecording(false);
    setLiveTranscript("");
    setRecordingSeconds(0);
  };

  const finishAndSendRecording = async () => {
    const finalSecs = recordingSeconds;
    const finalTranscript = liveTranscript.trim();
    stopAudioStreams();
    setIsRecording(false);

    const mins = Math.floor(finalSecs / 60);
    const secs = finalSecs % 60;
    const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    const voiceMessage = finalTranscript
      ? `[Voice Reflection • ${timeFormatted}] "${finalTranscript}"`
      : `[Voice Reflection • ${timeFormatted}] (Audio message recorded anonymously)`;

    await handleSend(voiceMessage);
    setLiveTranscript("");
    setRecordingSeconds(0);
  };

  const playVoiceMessage = (text: string, idx: number) => {
    if (typeof window === "undefined") return;
    if (currentlyPlayingIdx === idx) {
      window.speechSynthesis?.cancel();
      setCurrentlyPlayingIdx(null);
      return;
    }

    window.speechSynthesis?.cancel();
    setCurrentlyPlayingIdx(idx);

    // Extract quote or speak whole text
    const quoteMatch = text.match(/"([^"]+)"/);
    const spokenText = quoteMatch ? quoteMatch[1] : text.replace(/\[.*?\]/, "").trim() || "Voice message";

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.onend = () => setCurrentlyPlayingIdx(null);
    utterance.onerror = () => setCurrentlyPlayingIdx(null);
    window.speechSynthesis?.speak(utterance);
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
        <button 
          onClick={() => router.back()} 
          aria-label="Exit thread safely" 
          className="w-10 h-10 rounded-full bg-elevated-onyx flex items-center justify-center text-muted-silver hover:text-starlight-white active:scale-95 transition-all duration-150"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_8px_rgba(5,150,105,0.8)]"></span>
            <span className="font-mono-data text-mono-data font-medium text-starlight-white tracking-tight">
              Thread {thread?.id?.slice(0, 8).toUpperCase() || "..."}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px] text-mint">lock</span>
            <span className="font-label text-[11px] text-muted-silver tracking-wide">Zero Logs Encrypted</span>
          </div>
        </div>
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
      <main ref={chatScrollRef} className="flex-1 w-full max-w-2xl mx-auto px-margin pt-space-md pb-40 overflow-y-auto no-scrollbar flex flex-col gap-space-lg">
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

        {messages.map((msg, idx) => {
          const isVoice = msg.ciphertext.startsWith("[Voice Reflection") || msg.ciphertext.startsWith("[Voice Note");
          return (
            <div key={idx} className={`flex flex-col ${msg.senderRole === "SEEKER" ? "items-end self-end" : "items-start self-start"} gap-1.5 max-w-[88%]`}>
              {msg.senderRole === "SEEKER" ? (
                <>
                  <div className="bg-elevated-onyx border border-white/10 rounded-2xl rounded-tr-sm p-space-md shadow-md text-starlight-white">
                    {isVoice ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 bg-canvas-deep/70 px-3 py-2 rounded-xl border border-white/10">
                          <button
                            onClick={() => playVoiceMessage(msg.ciphertext, idx)}
                            className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-transform"
                            type="button"
                            title={currentlyPlayingIdx === idx ? "Pause voice message" : "Listen to voice reflection"}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {currentlyPlayingIdx === idx ? "stop" : "play_arrow"}
                            </span>
                          </button>
                          <div className="flex-1 flex items-center gap-1">
                            <span className="w-1 h-3 bg-primary-container/80 rounded-full animate-pulse"></span>
                            <span className="w-1 h-5 bg-primary-container rounded-full"></span>
                            <span className="w-1 h-2 bg-primary-container/60 rounded-full"></span>
                            <span className="w-1 h-6 bg-primary-container rounded-full"></span>
                            <span className="w-1 h-4 bg-primary-container/70 rounded-full"></span>
                            <span className="w-1 h-2 bg-primary-container/50 rounded-full"></span>
                          </div>
                          <span className="font-mono-data text-xs text-muted-silver">
                            {msg.ciphertext.match(/•\s*([\d:]+)/)?.[1] || "Audio"}
                          </span>
                        </div>
                        <p className="font-body-sm text-xs text-muted-silver/90 italic pl-1">
                          {msg.ciphertext.replace(/\[.*?\]\s*/, "")}
                        </p>
                      </div>
                    ) : (
                      <p className="font-body-md text-body-md leading-relaxed font-normal">{msg.ciphertext}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-silver font-label text-[11px] pr-1">
                    <span className="font-mono-data text-[11px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
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
                    {isVoice ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 bg-canvas-deep/70 px-3 py-2 rounded-xl border border-white/10">
                          <button
                            onClick={() => playVoiceMessage(msg.ciphertext, idx)}
                            className="w-8 h-8 rounded-full bg-secondary text-canvas-deep flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-transform"
                            type="button"
                            title={currentlyPlayingIdx === idx ? "Pause voice message" : "Listen to responder message"}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {currentlyPlayingIdx === idx ? "stop" : "play_arrow"}
                            </span>
                          </button>
                          <div className="flex-1 flex items-center gap-1">
                            <span className="w-1 h-3 bg-secondary/80 rounded-full animate-pulse"></span>
                            <span className="w-1 h-5 bg-secondary rounded-full"></span>
                            <span className="w-1 h-2 bg-secondary/60 rounded-full"></span>
                            <span className="w-1 h-6 bg-secondary rounded-full"></span>
                            <span className="w-1 h-4 bg-secondary/70 rounded-full"></span>
                            <span className="w-1 h-2 bg-secondary/50 rounded-full"></span>
                          </div>
                          <span className="font-mono-data text-xs text-muted-silver">
                            {msg.ciphertext.match(/•\s*([\d:]+)/)?.[1] || "Voice"}
                          </span>
                        </div>
                        <p className="font-body-sm text-xs text-muted-silver/90 italic pl-1">
                          {msg.ciphertext.replace(/\[.*?\]\s*/, "")}
                        </p>
                      </div>
                    ) : (
                      <p className="font-body-md text-body-md leading-relaxed">{msg.ciphertext}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-silver font-label text-[11px] pl-1">
                    <span className="font-mono-data text-[11px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>•</span>
                    <span className="text-secondary font-medium">Verified Responder</span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Live Empathy Status / Typing Indicator */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 max-w-fit">
          <div className="flex items-center gap-1 bg-elevated-onyx px-2.5 py-1.5 rounded-full border border-white/5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse [animation-delay:0.4s]"></span>
          </div>
          <span className="font-label text-body-sm text-muted-silver italic">Responder is reflecting on your message...</span>
        </div>
      </main>

      {/* STICKY BOTTOM COMPOSER BAR & DOCKED CONTROLS */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-canvas-deep via-canvas-deep to-canvas-deep/80 backdrop-blur-lg pt-2 pb-safe">
        <div className="max-w-2xl mx-auto px-margin pb-space-sm flex flex-col gap-2">
          {/* If Recording Voice: Display Active Voice Recording Bar */}
          {isRecording ? (
            <div className="bg-elevated-onyx border border-rose/60 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose"></span>
                </span>
                <span className="font-mono-data font-bold text-starlight-white text-sm shrink-0">
                  {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? "0" : ""}{recordingSeconds % 60}
                </span>
                <div className="hidden sm:flex items-center gap-0.5 shrink-0 text-rose">
                  <span className="w-1 h-3 bg-rose rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1 h-5 bg-rose rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 h-2 bg-rose rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-6 bg-rose rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="w-1 h-3 bg-rose rounded-full animate-bounce [animation-delay:0.1s]"></span>
                </div>
                <span className="text-xs text-muted-silver italic truncate">
                  {liveTranscript || "Listening to your voice..."}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={cancelRecording}
                  className="p-2 rounded-full text-muted-silver hover:text-rose hover:bg-rose/10 transition-colors cursor-pointer"
                  title="Discard recording"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
                <button 
                  onClick={finishAndSendRecording}
                  className="px-4 py-2 rounded-full bg-primary-container hover:brightness-110 text-starlight-white font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <span>Send Voice</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text Composer */
            <div className="bg-elevated-onyx border border-white/15 rounded-2xl p-2 shadow-xl flex items-end gap-2 focus-within:border-secondary transition-colors duration-150">
              {/* Mic button: Starts real recording */}
              <button 
                onClick={startRecording}
                aria-label="Record voice reflection" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer text-muted-silver hover:text-starlight-white hover:bg-surface-container active:scale-95" 
                type="button"
                title="Record voice reflection"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              {/* Guided breathing modal trigger */}
              <button 
                onClick={() => setIsBreathingOpen(true)}
                aria-label="Guided breathing exercise" 
                className="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-tertiary-fixed active:scale-95 transition-all cursor-pointer" 
                type="button"
                title="Open guided breathing"
              >
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </button>
              {/* Text Input */}
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
              {/* Send Button */}
              <button 
                onClick={() => handleSend()} 
                disabled={isSending || !content.trim()} 
                aria-label="Send message anonymously" 
                className="w-10 h-10 rounded-full bg-primary-container text-starlight-white font-semibold flex items-center justify-center shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-95 transition-transform duration-150 flex-shrink-0 cursor-pointer" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-center pb-1">
            <span className="material-symbols-outlined text-[13px] text-muted-silver">lock</span>
            <p className="font-mono-data text-[11px] text-muted-silver tracking-tight">
              Zero-knowledge encryption • Instant purge on exit
            </p>
          </div>
        </div>
      </footer>

      {/* Guided Breathing Modal */}
      {isBreathingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl animate-spin [animation-duration:8s]">spa</span>
            </div>
            <h3 className="text-headline-sm font-semibold text-starlight-white">Box Breathing Cadence</h3>
            <p className="text-muted-silver text-xs leading-relaxed">
              Inhale for 4 seconds, hold gently for 4 seconds, exhale slowly for 6 seconds.
            </p>
            <div className="py-2">
              <div className="w-24 h-24 rounded-full border-2 border-mint/40 mx-auto flex items-center justify-center animate-pulse">
                <span className="text-mint font-mono-data text-xs font-semibold">Exhale</span>
              </div>
            </div>
            <button
              onClick={() => setIsBreathingOpen(false)}
              className="w-full py-2 rounded-full bg-surface-container-high hover:bg-surface-container text-starlight-white text-xs font-medium"
              type="button"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* Purge Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-rose/30 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose/20 text-rose flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-headline-sm font-semibold text-starlight-white">Permanently Delete Data?</h3>
            <p className="text-muted-silver text-xs leading-relaxed">
              This will destroy all cryptographic session keys. Backups and memory caches cannot be recovered.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleCancelPurge}
                className="px-4 py-2 rounded-full border border-white/20 text-muted-silver text-xs hover:text-white"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-full bg-rose text-white text-xs font-semibold hover:bg-rose/90"
                type="button"
              >
                Destroy Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
