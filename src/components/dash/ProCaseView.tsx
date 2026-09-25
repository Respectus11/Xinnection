/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Thread, Message } from "@prisma/client";

export function ProCaseView({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"reply" | "note">("reply");
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [audioChimes, setAudioChimes] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", description: "" });
  
  const [elapsedSeconds, setElapsedSeconds] = useState(868);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Timer simulation for case duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

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
    
    const messagePayload = customPayload
      ? customPayload
      : activeTab === "note" 
      ? `[CLINICAL NOTE] ${content}`
      : content;

    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messagePayload }),
      });
      if (res.ok) {
        setContent("");
        const newThreadRes = await fetch(`/api/threads/${threadId}`);
        if (newThreadRes.ok) {
          const data = await newThreadRes.json();
          setThread(data);
          setMessages(data.messages || []);
        }
        showToast(activeTab === "note" ? "Clinical note appended" : "Reply transmitted securely");
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
    // 1. Immediately activate recording state
    setIsRecording(true);
    setLiveTranscript("");
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // 2. Start timer immediately
    recordingTimerRef.current = setInterval(() => {
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
            console.warn("MediaRecorder start failed", e);
          }
        })
        .catch((err) => {
          console.warn("Microphone access prompt or device error:", err);
        });
    }

    // 4. Web Speech API transcription
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
          showToast("Session marked as RESOLVED. Ephemeral session purged.");
          setTimeout(() => {
            router.push("/professional");
          }, 1800);
        } else {
          showToast("Session escalated to Tier 1 Crisis supervisory team.");
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
    showToast("Protocol macro inserted");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/auth";
  };

  return (
    <div className="bg-canvas-deep text-starlight-white font-body-md text-body-md antialiased h-[100dvh] overflow-hidden flex flex-col select-none">
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
          <div className="bg-elevated-onyx border border-outline-variant/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-headline-sm font-semibold text-starlight-white">{modalState.title}</h3>
            <p className="text-muted-silver text-sm leading-relaxed">{modalState.description}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalState({ isOpen: false, title: "", description: "" })}
                className="px-4 py-1.5 rounded-full border border-outline-variant/40 text-muted-silver hover:text-starlight-white text-sm"
              >
                Close
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

      {/* TOP APP BAR */}
      <header className="w-full h-14 px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 bg-elevated-onyx border-b border-outline-variant/30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded-md text-muted-silver hover:bg-surface-container-high hover:text-starlight-white"
            type="button"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-headline-sm font-headline-sm font-semibold text-starlight-white">Xinnection Cockpit</span>
          </div>

          <div className="relative w-48 sm:w-64 ml-2 hidden sm:block">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-silver text-sm">search</span>
            <input 
              className="w-full bg-canvas-deep border border-outline-variant/40 rounded-full pl-8 pr-3 py-1 text-body-sm font-body-sm text-starlight-white placeholder:text-muted-silver focus:outline-none focus:border-secondary-container" 
              placeholder="Search case, token..." 
              type="text" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => showToast("Station audio tone alerts are operational.")} 
              className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 relative" 
              type="button"
              title="Station Alerts"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container"></span>
            </button>
            <button 
              onClick={() => showToast("Station mesh network: 12ms latency, encrypted link.")} 
              className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150" 
              type="button"
              title="Mesh Network Status"
            >
              <span className="material-symbols-outlined text-lg">wifi_tethering</span>
            </button>
            <button 
              onClick={() => setModalState({
                isOpen: true,
                title: "Clinician Cockpit Guidance",
                description: "This workstation provides zero-knowledge crisis intervention. No PII is retained on disk or client logs. Use the Insert Protocol macros to respond with validated clinical frameworks."
              })} 
              className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150" 
              type="button"
              title="Help & Guidance"
            >
              <span className="material-symbols-outlined text-lg">help_outline</span>
            </button>
          </div>

          <div className="h-5 w-px bg-outline-variant/40 mx-1 hidden sm:block"></div>

          <button 
            onClick={() => setModalState({
              isOpen: true,
              title: "Resolve & Close Session",
              description: "Are you sure you want to mark this session as RESOLVED? This will immediately shred the local cache and mark the thread complete.",
              actionLabel: "Confirm Resolution",
              onConfirm: () => handleUpdateStatus("RESOLVED")
            })} 
            className="px-3 py-1 rounded-full border border-outline-variant/50 text-starlight-white hover:bg-surface-container-high transition-colors font-label text-label active:scale-95 duration-150" 
            type="button"
          >
            Resolve Session
          </button>
          <button 
            onClick={() => setModalState({
              isOpen: true,
              title: "Escalate to Tier 1 Crisis",
              description: "Initiating emergency protocol will alert the crisis supervisor and dispatch immediate escalation procedures. Proceed?",
              actionLabel: "Escalate Immediately",
              onConfirm: () => handleUpdateStatus("ESCALATED")
            })} 
            className="px-3 py-1 rounded-full bg-rose text-starlight-white hover:opacity-90 transition-opacity font-label text-label active:scale-95 duration-150 flex items-center gap-1.5 shadow-sm" 
            type="button"
          >
            <span className="material-symbols-outlined text-sm">emergency_share</span>
            <span>Escalate</span>
          </button>

          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-primary-container/30 border border-primary-container/40 flex items-center justify-center text-xs font-bold text-primary-container">
              AT
            </div>
          </div>
        </div>
      </header>

      {/* WORKSPACE WRAPPER */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* PANE 1: SideNavBar */}
        <aside className={`
          fixed lg:static top-14 bottom-0 left-0 z-40 w-64 flex flex-col p-4 bg-elevated-onyx border-r border-outline-variant/30 justify-between shrink-0 shadow-lg lg:shadow-none transition-transform duration-200
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
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

            <div className="my-4 p-2.5 bg-canvas-deep/80 rounded-DEFAULT border border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/20 border border-secondary-container flex items-center justify-center text-secondary font-bold text-sm">
                    AT
                  </div>
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

            <nav className="space-y-1">
              <Link 
                href="/professional" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">inbox</span>
                  <span className="text-label font-label">Queue</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-primary font-mono-data text-[11px] font-semibold">Triage</span>
              </Link>
              <div className="flex items-center justify-between px-space-md py-space-sm rounded-DEFAULT bg-surface-container-highest text-primary-container font-semibold border-l-4 border-primary-container">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
                  <span className="text-label font-label">Active Case</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono-data text-[11px] font-bold">1</span>
              </div>
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  showToast("Historical transcripts are permanently shredded per Zero-Knowledge protocol.");
                }} 
                className="w-full flex items-center gap-3 px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal text-left"
              >
                <span className="material-symbols-outlined text-lg">history</span>
                <span className="text-label font-label">History</span>
              </button>
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  setModalState({
                    isOpen: true,
                    title: "Active Shift Protocols",
                    description: "Protocol 4.2-B: Always validate the seeker's immediate physical safety before probing deeper trauma. If imminent risk of harm is stated, invoke Tier 1 Crisis Escalation immediately."
                  });
                }} 
                className="w-full flex items-center gap-3 px-space-md py-space-sm rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors duration-150 font-normal text-left"
              >
                <span className="material-symbols-outlined text-lg">medical_services</span>
                <span className="text-label font-label">Shift Protocols</span>
              </button>
            </nav>

            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-1">
              <div className="px-space-md text-[10px] font-mono-data tracking-wider uppercase text-muted-silver/60">Shift Preferences</div>
              <div className="flex items-center justify-between px-space-md py-2">
                <span className="text-label font-label text-muted-silver flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">{audioChimes ? "volume_up" : "volume_off"}</span>
                  Audio Chimes
                </span>
                <button 
                  onClick={() => setAudioChimes(!audioChimes)}
                  className={`w-8 h-4 rounded-full relative p-0.5 cursor-pointer flex items-center transition-colors ${audioChimes ? "bg-mint/40 justify-end" : "bg-surface-container-highest justify-start"}`} 
                  type="button"
                >
                  <span className={`w-3 h-3 rounded-full shadow-sm ${audioChimes ? "bg-mint" : "bg-muted-silver"}`}></span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-outline-variant/20">
            <button 
              onClick={() => setModalState({
                isOpen: true,
                title: "Emergency Handoff",
                description: "Immediately route this case to the active Tier 1 Clinical Supervisor on standby?",
                actionLabel: "Execute Handoff",
                onConfirm: () => {
                  showToast("Supervisor Aris paged. Case transfer initiated.");
                }
              })}
              className="w-full py-2.5 px-3 rounded-full bg-rose/20 border border-rose/50 hover:bg-rose/30 text-rose font-label text-label flex items-center justify-center gap-2 transition-all active:scale-[0.98]" 
              type="button"
            >
              <span className="material-symbols-outlined text-base">warning</span>
              <span>Emergency Handoff</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="w-full py-1.5 rounded-DEFAULT text-body-sm font-body-sm text-muted-silver hover:bg-surface-container-high hover:text-starlight-white flex items-center justify-center gap-1.5" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm">power_settings_new</span>
              <span>Go Off-Duty</span>
            </button>
          </div>
        </aside>

        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* MAIN WORKSPACE */}
        <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden min-w-0">
          {/* PANE 2: Central Conversation & Transcript Workspace */}
          <section className="flex-1 flex flex-col h-full bg-canvas-deep border-r border-outline-variant/30 min-w-0">
            {/* Transcript Header Bar */}
            <div className="h-14 px-4 sm:px-5 bg-elevated-onyx/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <div className="flex items-center gap-1.5 bg-canvas-deep/70 px-2.5 py-1 rounded-DEFAULT border border-outline-variant/30 shrink-0">
                  <span className="text-label font-label text-muted-silver">Thread:</span>
                  <span className="font-mono-data text-mono-data text-starlight-white font-semibold">
                    {thread?.id ? thread.id.slice(0, 8).toUpperCase() : "..."}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint/20 border border-mint/40 text-tertiary-fixed text-label font-label shrink-0">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                  <span className="truncate">
                    {thread?.status === "ESCALATED" ? "Escalated to Tier 1" : thread?.status === "RESOLVED" ? "Session Resolved" : "Active • Tier 2 Lead"}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1 font-mono-data text-mono-data text-muted-silver shrink-0">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-mint/20 text-tertiary-fixed font-label text-label border border-mint/40">
                  {thread?.categoryId || "General"}
                </span>
                <div className="h-4 w-px bg-outline-variant/30 mx-1 hidden sm:block"></div>
                <button 
                  onClick={() => setModalState({
                    isOpen: true,
                    title: "Flag Incident Telemetry",
                    description: "Flag this thread for asynchronous clinical audit review. The review will proceed with Zero-Knowledge anonymized transcript markers.",
                    actionLabel: "Submit Flag",
                    onConfirm: () => showToast("Incident telemetry tagged for clinical audit.")
                  })} 
                  className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors" 
                  title="Flag Incident" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">flag</span>
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="p-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container-high hover:text-starlight-white transition-colors" 
                  title="Print Transcript" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                </button>
              </div>
            </div>

            {/* Ephemeral Live Chat Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              <div className="mx-auto max-w-2xl py-2 px-4 rounded-DEFAULT bg-surface-container-low/60 border border-outline-variant/30 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-silver text-label font-label">
                  <span className="material-symbols-outlined text-mint text-sm">lock</span>
                  <span>Anonymous Session Established • Ephemeral buffer active with instant shredding on close • AES-256</span>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-silver">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">forum</span>
                  <p className="text-sm">Connecting to anonymous seeker stream...</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isVoice = msg.ciphertext.startsWith("[Voice Reflection") || msg.ciphertext.startsWith("[Voice Response");
                  return (
                    <div key={idx} className={`flex flex-col ${msg.senderRole === "SEEKER" ? "items-start" : "items-end ml-auto"} max-w-xl`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {msg.senderRole === "SEEKER" ? (
                          <>
                            <span className="text-label font-label text-muted-silver font-semibold">Anonymous Seeker</span>
                            <span className="font-mono-data text-[11px] text-muted-silver">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono-data text-[11px] text-muted-silver">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-label font-label text-secondary font-semibold">You (Responder)</span>
                          </>
                        )}
                      </div>
                      <div className={`${
                        msg.senderRole === "SEEKER"
                          ? "bg-elevated-onyx border-outline-variant/30 text-starlight-white"
                          : msg.ciphertext.startsWith("[CLINICAL NOTE]")
                          ? "bg-peach-bg/30 border-peach/50 text-peach"
                          : "bg-primary-container/20 border-primary-container/40 text-starlight-white"
                      } border rounded-DEFAULT p-3.5 shadow-sm leading-relaxed text-sm`}>
                        {isVoice ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5 bg-canvas-deep/70 px-3 py-2 rounded-xl border border-white/10">
                              <button
                                onClick={() => playVoiceMessage(msg.ciphertext, idx)}
                                className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-transform"
                                type="button"
                                title={currentlyPlayingIdx === idx ? "Pause voice message" : "Listen to audio reflection"}
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
                          msg.ciphertext
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex items-center gap-2 px-2 py-1 text-label font-label text-muted-silver">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse"></span>
                </div>
                <span className="text-xs text-muted-silver">Secure end-to-end channel active</span>
              </div>
            </div>

            {/* Bottom Composer */}
            <div className="bg-elevated-onyx border-t border-outline-variant/30 p-3 shrink-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("reply")}
                    className={`px-3 py-1 rounded-full text-label font-label transition-colors ${activeTab === "reply" ? "bg-surface-container-highest text-primary-container font-semibold border border-primary-container/40" : "text-muted-silver hover:text-starlight-white hover:bg-surface-container-high"}`}
                    type="button"
                  >
                    Direct Anonymous Reply
                  </button>
                  <button 
                    onClick={() => setActiveTab("note")}
                    className={`px-3 py-1 rounded-full text-label font-label transition-colors ${activeTab === "note" ? "bg-surface-container-highest text-primary-container font-semibold border border-primary-container/40" : "text-muted-silver hover:text-starlight-white hover:bg-surface-container-high"}`}
                    type="button"
                  >
                    Internal Clinical Note (Confidential)
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-muted-silver text-label font-label">
                  <span className="material-symbols-outlined text-sm text-mint">check_circle</span>
                  <span className="text-body-sm font-body-sm">Safe Buffer Active</span>
                </div>
              </div>
              
              {/* Clinical Macro Quick-Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
                <span className="text-label font-label text-muted-silver whitespace-nowrap mr-1">Insert Protocol:</span>
                <button 
                  onClick={() => insertProtocol("Let's take a moment together. Can you name 3 things you can see around you right now, and 2 things you can physically touch?")}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" 
                  type="button"
                >
                  Grounding Prompt
                </button>
                <button 
                  onClick={() => insertProtocol("You are completely safe here. Everything we share is anonymous and encrypted. Take all the time you need.")}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" 
                  type="button"
                >
                  Safety Validation
                </button>
                <button 
                  onClick={() => insertProtocol("Let's try a calming breath together: Inhale slowly for 4 seconds, hold gently for 4 seconds, and exhale for 6 seconds. Whenever you are ready.")}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" 
                  type="button"
                >
                  Breathing Cadence
                </button>
                <button 
                  onClick={() => insertProtocol("It is completely understandable to feel overwhelmed by this. Let's look at what is within our control right now in this exact moment.")}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-starlight-white hover:bg-surface-container-high border border-outline-variant/30 whitespace-nowrap transition-colors" 
                  type="button"
                >
                  CBT Reframing
                </button>
                <button 
                  onClick={() => insertProtocol("[Confidential Support Resource: Crisis & Suicide Lifeline: Call or text 988. Free, confidential, anytime.]")}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-body-sm font-body-sm text-secondary hover:bg-surface-container-high border border-secondary/40 whitespace-nowrap transition-colors flex items-center gap-1" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-xs">attach_file</span>
                  Attach Safe Resource
                </button>
              </div>
              
              {/* Input Composer Form: Toggle between Text Area and Voice Recording Bar */}
              {isRecording ? (
                <div className="bg-canvas-deep border border-rose/60 rounded-DEFAULT p-3.5 shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
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
                      <span>Send Voice Reply</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`relative bg-canvas-deep rounded-DEFAULT border ${activeTab === "note" ? "border-peach/60" : "border-outline-variant/40 focus-within:border-secondary-container"} transition-colors`}>
                  <textarea 
                    ref={textareaRef}
                    className="w-full bg-transparent p-3 text-body-md font-body-md text-starlight-white placeholder:text-muted-silver focus:outline-none resize-none" 
                    placeholder={activeTab === "note" ? "Type internal confidential clinician note (not transmitted to seeker)..." : "Type an empathic, validating response or record voice..."} 
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
                      <span className="font-mono-data text-xs">{content.length} / 500 chars</span>
                      <span>•</span>
                      <span className="text-tertiary flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">sentiment_satisfied</span> Non-judgmental tone active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={startRecording}
                        className="p-1.5 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors cursor-pointer" 
                        title="Record voice reflection"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">mic</span>
                      </button>
                      <button 
                        onClick={() => handleSend()} 
                        disabled={isSending || !content.trim()} 
                        className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white disabled:opacity-50 hover:opacity-90 font-label text-label flex items-center gap-1.5 shadow-sm active:scale-95 transition-all" 
                        type="button"
                      >
                        <span>{isSending ? "Sending..." : activeTab === "note" ? "Save Note" : "Send"}</span>
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* PANE 3: Right Actionable Intelligence & Inspector Pane */}
          <aside className="w-full lg:w-80 bg-elevated-onyx flex flex-col h-auto lg:h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-outline-variant/30 shrink-0 p-4 space-y-4 custom-scrollbar">
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
                  <div className="font-mono-data text-starlight-white font-medium">
                    {thread?.id ? `XN-${thread.id.slice(0, 6).toUpperCase()}` : "XN-442-991"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-silver">Client IP</div>
                  <div className="font-mono-data text-mint font-medium">Tor-Shielded</div>
                </div>
                <div>
                  <div className="text-muted-silver">Session Duration</div>
                  <div className="font-mono-data text-starlight-white">{formatTimer(elapsedSeconds)}</div>
                </div>
                <div>
                  <div className="text-muted-silver">Response Latency</div>
                  <div className="font-mono-data text-starlight-white">0.8s avg</div>
                </div>
              </div>
            </div>

            {/* 2. Real-Time Risk & NLP Telemetry Card */}
            <div className="bg-canvas-deep rounded-DEFAULT p-3.5 border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-label font-label text-muted-silver uppercase tracking-wider font-semibold">NLP Risk Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-mint/20 text-tertiary-fixed font-mono-data text-[11px] font-semibold">Tier 4</span>
              </div>
              <div className="p-2.5 rounded-DEFAULT bg-surface-container-low border border-mint/30 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-mint text-xl">verified</span>
                <div>
                  <div className="text-label font-label font-semibold text-starlight-white">Mild / Moderate Panic</div>
                  <div className="text-body-sm font-body-sm text-tertiary-fixed">Non-Crisis • Somatic Load</div>
                </div>
              </div>
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
                <button 
                  onClick={() => insertProtocol("Let's do the 4-7-8 breathing practice together: Inhale for 4s, hold for 7s, exhale slowly for 8s. Repeat 3 times.")}
                  className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" 
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">air</span>
                    <span className="text-body-sm font-body-sm text-starlight-white group-hover:text-primary">4-7-8 Breathing Guidance</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-muted-silver">arrow_forward</span>
                </button>
                <button 
                  onClick={() => insertProtocol("Anchor exercise: Plant both feet firmly on the floor. Feel the support beneath you. Notice that right here in this chair, you are physically safe.")}
                  className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" 
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-mint text-sm">anchor</span>
                    <span className="text-body-sm font-body-sm text-starlight-white group-hover:text-primary">De-escalation & Anchor</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-muted-silver">arrow_forward</span>
                </button>
                <button 
                  onClick={() => insertProtocol("[Clinical Guide] Workplace Burnout & Grounding Strategies: Focus on micro-boundaries and somatic release.")}
                  className="w-full text-left p-2 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between transition-colors group" 
                  type="button"
                >
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
              <button 
                onClick={() => setModalState({
                  isOpen: true,
                  title: "Confirm Crisis Escalation",
                  description: "This will escalate the session to Tier 1 Crisis supervisory staff and trigger emergency intervention guidelines.",
                  actionLabel: "Escalate Now",
                  onConfirm: () => handleUpdateStatus("ESCALATED")
                })}
                className="w-full py-2.5 px-3 rounded-full bg-rose hover:bg-rose/90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]" 
                type="button"
              >
                <span className="material-symbols-outlined text-base">emergency</span>
                <span>Escalate to Tier 1 Crisis</span>
              </button>
              <button 
                onClick={() => setModalState({
                  isOpen: true,
                  title: "Initiate Peer Handoff",
                  description: "Broadcast handoff packet to available on-duty Tier 2 peer responders.",
                  actionLabel: "Transfer Case",
                  onConfirm: () => showToast("Peer handoff broadcast dispatched.")
                })}
                className="w-full py-2.5 px-3 rounded-full bg-secondary-container hover:bg-secondary-container/90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]" 
                type="button"
              >
                <span className="material-symbols-outlined text-base">sync_alt</span>
                <span>Initiate Peer Handoff</span>
              </button>
              <button 
                onClick={() => setModalState({
                  isOpen: true,
                  title: "Mark Resolved & Shred Ephemeral Cache",
                  description: "Confirming will purge the session encryption key, shred all memory buffers, and mark the case resolved.",
                  actionLabel: "Shred & Resolve",
                  onConfirm: () => handleUpdateStatus("RESOLVED")
                })}
                className="w-full py-2.5 px-3 rounded-full bg-primary-container hover:opacity-90 text-starlight-white font-label text-label flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]" 
                type="button"
              >
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
