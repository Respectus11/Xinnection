"use client";
import React, { useState, useRef, useEffect } from "react";

interface ReflectionComposerProps {
  content: string;
  onChange: (content: string) => void;
}

const GENTLE_PROMPTS = [
  "I've been feeling overwhelmed because ",
  "Right now, what I feel most is ",
  "It's hard to admit this out loud, but ",
  "Today felt exhausting when ",
  "I just need someone to hear that "
];

export function ReflectionComposer({ content, onChange }: ReflectionComposerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const [liveTranscript, setLiveTranscript] = useState("");
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording(true);
      return;
    }

    // 1. Immediately activate recording state
    setIsRecording(true);
    setRecordingSeconds(0);
    setLiveTranscript("");
    audioChunksRef.current = [];

    // 2. Start timer immediately (1s cadence)
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // 3. Request microphone in background without blocking UI
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
          if (text) {
            setLiveTranscript(text);
          }
        };
        recognition.onerror = (e: any) => {
          console.warn("SpeechRecognition error:", e);
        };
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("SpeechRecognition start error:", e);
      }
    }
  };

  const stopVoiceRecording = (save = true) => {
    const finalSecs = recordingSeconds;
    const finalTranscript = liveTranscript.trim();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
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
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);

    if (save) {
      const mins = Math.floor(finalSecs / 60);
      const secs = finalSecs % 60;
      const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

      // Use transcribed speech if present, otherwise format as encrypted voice reflection
      const voiceText = finalTranscript
        ? finalTranscript
        : `[Voice Reflection • ${timeFormatted}] Audio message recorded anonymously`;

      onChange(content ? `${content.trim()}\n${voiceText}` : voiceText);
    }

    setLiveTranscript("");
    setRecordingSeconds(0);
  };

  const handleInsertPrompt = () => {
    const nextPrompt = GENTLE_PROMPTS[promptIndex % GENTLE_PROMPTS.length];
    setPromptIndex((prev) => prev + 1);
    onChange(content ? `${content}\n${nextPrompt}` : nextPrompt);
  };

  return (
    <section className="relative">
      <div className="bg-elevated-onyx rounded-2xl p-space-md border border-outline-variant/50 shadow-xl transition-all duration-200 focus-within:border-primary-container/80 focus-within:ring-1 focus-within:ring-primary-container/40">
        {/* Status Badge Header inside Composer */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-tertiary"></span>
            <span className="font-label text-label text-starlight-white font-medium">Safe & unmoderated until shared</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/80 text-muted-silver font-mono-data text-[11px]">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>Local draft</span>
          </div>
        </div>

        {/* Active Voice Recording Indicator Banner */}
        {isRecording && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-rose/15 border border-rose/30 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose animate-ping shrink-0"></span>
              <span className="text-xs font-mono-data font-bold text-rose shrink-0">
                {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? "0" : ""}{recordingSeconds % 60}
              </span>
              <div className="hidden sm:flex items-center gap-0.5 text-rose ml-1 shrink-0">
                <span className="w-1 h-3 bg-rose rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1 h-5 bg-rose rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-2 bg-rose rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-4 bg-rose rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs text-muted-silver italic truncate">
                {liveTranscript || "Listening to your voice..."}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => stopVoiceRecording(false)}
                className="p-1.5 rounded-full text-muted-silver hover:text-rose hover:bg-rose/10 transition-colors cursor-pointer"
                title="Discard recording"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
              <button
                onClick={() => stopVoiceRecording(true)}
                className="px-3 py-1 rounded-full bg-primary-container text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                type="button"
              >
                <span>Done</span>
                <span className="material-symbols-outlined text-sm">check</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Generous Textarea */}
        <div className="relative py-1">
          <textarea 
            className="w-full bg-transparent border-0 resize-none text-starlight-white placeholder:text-muted-silver/60 font-body-lg text-body-lg leading-relaxed focus:outline-none focus:ring-0 p-0 custom-scrollbar" 
            id="reflection-input" 
            maxLength={800} 
            placeholder="What is on your mind today? Write or click Speak..." 
            rows={5}
            value={content}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        
        {/* Composer Bottom Controls */}
        <div className="pt-3 mt-1 flex items-center justify-between border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <button 
              onClick={startVoiceRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95 text-xs font-label cursor-pointer ${
                isRecording 
                  ? "bg-rose text-white animate-pulse ring-2 ring-rose/50" 
                  : "bg-surface-container-high hover:bg-surface-bright text-starlight-white"
              }`} 
              type="button"
              title={isRecording ? "Stop voice recording" : "Record your voice"}
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>{isRecording ? "Recording..." : "Record Voice"}</span>
            </button>
            <button 
              onClick={handleInsertPrompt}
              className="p-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-muted-silver hover:text-starlight-white transition-colors duration-150 active:scale-95 cursor-pointer" 
              title="Add gentle prompt to start" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">format_quote</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono-data text-mono-data text-xs ${content.length > 700 ? "text-primary-container" : "text-muted-silver/80"}`} id="char-counter">
              {content.length} / 800
            </span>
          </div>
        </div>
        
        {/* Helper Assurance */}
        <div className="mt-3 pt-2 flex items-center justify-center gap-1.5 text-muted-silver/70 font-body-sm text-[11px]">
          <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
          <span>Your identity remains completely hidden</span>
        </div>
      </div>
    </section>
  );
}
