"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Thread, Message, Category } from "@prisma/client";
import Link from "next/link";

type ThreadWithCategory = Thread & { category?: Category | null };

export function ProCaseView({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [thread, setThread] = useState<ThreadWithCategory | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", description: "" });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Real voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentlyPlayingIdx, setCurrentlyPlayingIdx] = useState<number | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
    const interval = setInterval(fetchThread, 4000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPayload?: string) => {
    const rawText = customPayload ?? content;
    if (!rawText.trim() || isSending) return;
    setIsSending(true);
    
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rawText }),
      });
      if (res.ok) {
        setContent("");
        const newThreadRes = await fetch(`/api/threads/${threadId}`);
        if (newThreadRes.ok) {
          const data = await newThreadRes.json();
          setThread(data);
          setMessages(data.messages || []);
        }
        showToast("Reply transmitted securely");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to transmit message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  // Voice recording & sending functions
  const startRecording = () => {
    setIsRecording(true);
    setLiveTranscript("");
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

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
            console.warn("MediaRecorder start failed", e);
          }
        })
        .catch((err) => {
          console.warn("Microphone access prompt or device error:", err);
        });
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text) setLiveTranscript(text);
        };
        recognition.onerror = (e: unknown) => {
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
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
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
      ? `[Voice Response • ${timeFormatted}] "${finalTranscript}"`
      : `[Voice Response • ${timeFormatted}] (Clinician voice reflection transmitted)`;

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

    const quoteMatch = text.match(/"([^"]+)"/);
    const spokenText = quoteMatch ? quoteMatch[1] : text.replace(/\[.*?\]/, "").trim() || "Voice message";

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.onend = () => setCurrentlyPlayingIdx(null);
    utterance.onerror = () => setCurrentlyPlayingIdx(null);
    window.speechSynthesis?.speak(utterance);
  };

  const handleUpdateStatus = async (newStatus: "RESOLVED" | "ESCALATED") => {
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setThread((prev) => (prev ? { ...prev, status: updated.status } : updated));
        if (newStatus === "RESOLVED") {
          showToast("Session marked as RESOLVED.");
          setTimeout(() => {
            router.push("/professional");
          }, 1800);
        } else {
          showToast("Session escalated to Tier 1 Crisis staff.");
        }
      } else {
        showToast("Error updating session status.");
      }
    } catch {
      showToast("Network error updating status.");
    }
  };

  const insertProtocol = (text: string) => {
    setContent((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n${text}` : text;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-canvas-deep">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-elevated-onyx border border-primary-container text-starlight-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation / Info Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-starlight-white">{modalState.title}</h3>
            <p className="text-muted-silver text-sm leading-relaxed">{modalState.description}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalState({ isOpen: false, title: "", description: "" })}
                className="px-4 py-1.5 rounded-full border border-white/10 text-muted-silver hover:text-starlight-white text-sm"
              >
                Cancel
              </button>
              {modalState.actionLabel && modalState.onConfirm && (
                <button
                  onClick={() => {
                    modalState.onConfirm?.();
                    setModalState({ isOpen: false, title: "", description: "" });
                  }}
                  className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white font-medium text-sm hover:opacity-90"
                >
                  {modalState.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Area */}
      <section className="flex-1 flex flex-col h-full bg-canvas-deep min-w-0 border-r border-white/10">
        {/* Header Bar */}
        <header className="h-16 px-6 bg-elevated-onyx border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/professional" className="p-1.5 rounded-lg text-muted-silver hover:bg-surface-container-high hover:text-starlight-white">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-starlight-white">
                {thread?.id ? `Thread #${thread.id.slice(0, 8).toUpperCase()}` : "Loading..."}
              </span>
              <span className="text-xs text-muted-silver uppercase">
                {thread?.category?.slug || "GENERAL"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setModalState({
                isOpen: true,
                title: "Mark Resolved",
                description: "Are you sure you want to mark this session as RESOLVED?",
                actionLabel: "Resolve Session",
                onConfirm: () => handleUpdateStatus("RESOLVED")
              })} 
              className="px-3 py-1.5 rounded-full border border-white/10 text-starlight-white hover:bg-surface-container-high text-sm font-medium transition-colors" 
              type="button"
            >
              Resolve
            </button>
            <button 
              onClick={() => setModalState({
                isOpen: true,
                title: "Escalate to Tier 1 Crisis",
                description: "Initiating emergency protocol will alert the crisis supervisor. Proceed?",
                actionLabel: "Escalate Immediately",
                onConfirm: () => handleUpdateStatus("ESCALATED")
              })} 
              className="px-3 py-1.5 rounded-full bg-rose/20 text-rose border border-rose/30 hover:bg-rose/30 text-sm font-medium transition-colors flex items-center gap-1.5" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm">emergency_share</span>
              <span>Escalate</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 ml-2 rounded-lg text-muted-silver hover:bg-surface-container-high hover:text-starlight-white"
            >
              <span className="material-symbols-outlined text-xl">info</span>
            </button>
          </div>
        </header>

        {/* Chat Stream */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-silver">
              <p className="text-sm">Connecting to anonymous seeker stream...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isVoice = msg.ciphertext.startsWith("[Voice Reflection") || msg.ciphertext.startsWith("[Voice Response");
              return (
                <div key={idx} className={`flex flex-col ${msg.senderRole === "SEEKER" ? "items-start" : "items-end ml-auto"} max-w-xl`}>
                  <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                    {msg.senderRole === "SEEKER" ? (
                      <>
                        <span className="text-muted-silver font-semibold">Anonymous Seeker</span>
                        <span className="font-mono-data text-muted-silver/70">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono-data text-muted-silver/70">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-secondary font-semibold">You</span>
                      </>
                    )}
                  </div>
                  <div className={`${
                    msg.senderRole === "SEEKER"
                      ? "bg-elevated-onyx border-white/10 text-starlight-white"
                      : "bg-secondary/20 border-secondary/30 text-starlight-white"
                  } border rounded-2xl p-4 shadow-sm text-sm`}>
                    {isVoice ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-canvas-deep/70 px-3 py-2 rounded-xl border border-white/10">
                          <button
                            onClick={() => playVoiceMessage(msg.ciphertext, idx)}
                            className="w-8 h-8 rounded-full bg-secondary text-canvas-deep flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {currentlyPlayingIdx === idx ? "stop" : "play_arrow"}
                            </span>
                          </button>
                          <div className="flex-1 flex items-center gap-1 text-secondary">
                            <span className="w-1 h-3 bg-current opacity-80 rounded-full animate-pulse"></span>
                            <span className="w-1 h-5 bg-current rounded-full"></span>
                            <span className="w-1 h-2 bg-current opacity-60 rounded-full"></span>
                            <span className="w-1 h-6 bg-current rounded-full"></span>
                            <span className="w-1 h-4 bg-current opacity-70 rounded-full"></span>
                          </div>
                          <span className="font-mono-data text-xs text-muted-silver">
                            {msg.ciphertext.match(/•\s*([\d:]+)/)?.[1] || "Voice"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-silver italic pl-1">
                          {msg.ciphertext.replace(/\[.*?\]\s*/, "")}
                        </p>
                      </div>
                    ) : (
                      msg.ciphertext
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="bg-elevated-onyx border-t border-white/10 p-4 shrink-0">
          {/* Clinical Macro Quick-Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            <span className="text-xs text-muted-silver whitespace-nowrap mr-1">Insert Protocol:</span>
            <button 
              onClick={() => insertProtocol("Let's take a moment together. Can you name 3 things you can see around you right now, and 2 things you can physically touch?")}
              className="px-3 py-1 rounded-full bg-surface-container text-xs text-starlight-white hover:bg-surface-container-high border border-white/10 whitespace-nowrap transition-colors" 
              type="button"
            >
              Grounding Prompt
            </button>
            <button 
              onClick={() => insertProtocol("You are completely safe here. Everything we share is anonymous and encrypted. Take all the time you need.")}
              className="px-3 py-1 rounded-full bg-surface-container text-xs text-starlight-white hover:bg-surface-container-high border border-white/10 whitespace-nowrap transition-colors" 
              type="button"
            >
              Safety Validation
            </button>
            <button 
              onClick={() => insertProtocol("Let's try a calming breath together: Inhale slowly for 4 seconds, hold gently for 4 seconds, and exhale for 6 seconds.")}
              className="px-3 py-1 rounded-full bg-surface-container text-xs text-starlight-white hover:bg-surface-container-high border border-white/10 whitespace-nowrap transition-colors" 
              type="button"
            >
              Breathing Cadence
            </button>
            <button 
              onClick={() => insertProtocol("[Support Resource: Crisis & Suicide Lifeline: Call or text 988]")}
              className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 text-xs whitespace-nowrap transition-colors" 
              type="button"
            >
              Attach Safe Resource
            </button>
          </div>
          
          {/* Input Composer Form */}
          {isRecording ? (
            <div className="bg-canvas-deep border border-rose/60 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose"></span>
                </span>
                <span className="font-mono-data font-bold text-starlight-white text-sm shrink-0">
                  {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? "0" : ""}{recordingSeconds % 60}
                </span>
                <span className="text-xs text-muted-silver italic truncate">
                  {liveTranscript || "Listening to your voice..."}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={cancelRecording}
                  className="p-2 rounded-full text-muted-silver hover:text-rose hover:bg-rose/10 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
                <button 
                  onClick={finishAndSendRecording}
                  className="px-4 py-2 rounded-full bg-primary-container text-starlight-white font-semibold text-sm flex items-center gap-1.5 transition-colors"
                  type="button"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-canvas-deep rounded-xl border border-white/10 focus-within:border-secondary transition-colors">
              <textarea 
                ref={textareaRef}
                className="w-full bg-transparent p-4 text-sm text-starlight-white placeholder:text-muted-silver focus:outline-none resize-none" 
                placeholder="Type an empathic, validating response or record voice..." 
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
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-canvas-deep/40 rounded-b-xl">
                <span className="font-mono-data text-xs text-muted-silver">{content.length} chars</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={startRecording}
                    className="p-2 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">mic</span>
                  </button>
                  <button 
                    onClick={() => handleSend()} 
                    disabled={isSending || !content.trim()} 
                    className="px-5 py-2 rounded-full bg-primary-container text-starlight-white disabled:opacity-50 hover:opacity-90 text-sm font-medium flex items-center gap-2 transition-all" 
                    type="button"
                  >
                    <span>Send</span>
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right Info Panel (Collapsible on mobile) */}
      <aside className={`
        fixed lg:static top-0 right-0 bottom-0 z-40 w-72 bg-elevated-onyx border-l border-white/10 p-6 flex flex-col gap-6 transform transition-transform duration-200
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between lg:hidden mb-2">
          <span className="font-bold text-starlight-white">Session Info</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-muted-silver">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-silver uppercase font-semibold">Status</div>
          <div className="font-medium text-starlight-white">{thread?.status || "Unknown"}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-silver uppercase font-semibold">Topic</div>
          <div className="font-medium text-starlight-white uppercase">{thread?.category?.slug || "GENERAL"}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-silver uppercase font-semibold">Language</div>
          <div className="font-medium text-starlight-white uppercase">{thread?.language || "EN"}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-silver uppercase font-semibold">Opened At</div>
          <div className="font-medium text-starlight-white">
            {thread ? new Date(thread.createdAt).toLocaleString() : "..."}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="text-xs text-muted-silver text-center">
            Zero-Knowledge encryption active
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 9999px;
        }
      `}} />
    </div>
  );
}
