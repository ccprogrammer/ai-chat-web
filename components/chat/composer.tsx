"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Klass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return Klass ? new Klass() : null;
}

function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

/** Real-time voice waveform from microphone stream (Web Audio API). */
function VoiceWave({ stream, className }: { stream: MediaStream | null; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    function draw() {
      const canvas = canvasRef.current;
      if (!analyserRef.current || !canvas) return;
      rafRef.current = requestAnimationFrame(draw);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.offsetWidth || 200;
      const h = canvas.offsetHeight || 28;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, w, h);
      analyserRef.current!.getByteTimeDomainData(dataArray);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "var(--gh-danger)";
      ctx.beginPath();
      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128;
        const y = (v * h) / 2 + h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      analyserRef.current = null;
      audioContextRef.current?.close();
    };
  }, [stream]);

  if (!stream) return null;
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: 28, minHeight: 28, display: "block" }}
      width={200}
      height={28}
      aria-hidden
    />
  );
}

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  /** When true, no top border or background (for centering below greeting) */
  embedded?: boolean;
}

export function Composer({ onSend, disabled, embedded }: ComposerProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  /** While listening: committed text (final results) + interim (live) shown in input */
  const [speechCommitted, setSpeechCommitted] = useState("");
  const [speechInterim, setSpeechInterim] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechCommittedRef = useRef("");
  const speechInterimRef = useRef("");
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const speechSupported = isSpeechSupported();

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    setMediaStream(null);
  }, []);

  const displayValue = isListening ? speechCommitted + speechInterim : text;
  const hasText = displayValue.trim().length > 0;

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }
    stopMediaStream();
    const finalText = (speechCommittedRef.current + speechInterimRef.current).trimStart();
    if (finalText) setText(finalText);
    setSpeechCommitted("");
    setSpeechInterim("");
    speechCommittedRef.current = "";
    speechInterimRef.current = "";
    setIsListening(false);
    setSpeechError(null);
  }, [stopMediaStream]);

  const startListening = useCallback(() => {
    if (!speechSupported || disabled) return;
    setSpeechError(null);
    setSpeechCommitted(text.trimStart());
    setSpeechInterim("");
    speechCommittedRef.current = text.trimStart();
    const rec = getSpeechRecognition();
    if (!rec) {
      setSpeechError("Voice input not supported in this browser.");
      return;
    }
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = typeof navigator !== "undefined" ? navigator.language : "en";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let newCommitted = speechCommittedRef.current;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0].transcript;
        if (r.isFinal) {
          newCommitted += t;
        } else {
          interim = t;
        }
      }
      speechCommittedRef.current = newCommitted;
      speechInterimRef.current = interim;
      setSpeechCommitted(newCommitted);
      setSpeechInterim(interim);
    };
    rec.onend = () => {
      recognitionRef.current = null;
      stopMediaStream();
      setIsListening(false);
      setText((prev) => (speechCommittedRef.current.trim() || prev));
      setSpeechCommitted("");
      setSpeechInterim("");
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      setSpeechError(e.error === "not-allowed" ? "Microphone access was denied." : `Voice error: ${e.error}`);
      setIsListening(false);
      recognitionRef.current = null;
      stopMediaStream();
      setText((prev) => (speechCommittedRef.current.trim() || prev));
      setSpeechCommitted("");
      setSpeechInterim("");
    };
    const startRecognition = (stream: MediaStream) => {
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        setSpeechError("Could not start voice input.");
        stream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
        mediaStreamRef.current = null;
        recognitionRef.current = null;
      }
    };
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(startRecognition)
        .catch(() => {
          setSpeechError("Microphone access was denied.");
          recognitionRef.current = null;
        });
    } else {
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        setSpeechError("Could not start voice input.");
        recognitionRef.current = null;
      }
    }
  }, [speechSupported, disabled, text, stopMediaStream]);

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = displayValue.trim();
    if (!trimmed || disabled) return;
    if (isListening) {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          try {
            rec.stop();
          } catch {
            // ignore
          }
        }
        recognitionRef.current = null;
      }
      stopMediaStream();
      setIsListening(false);
      setSpeechCommitted("");
      setSpeechInterim("");
      speechCommittedRef.current = "";
      speechInterimRef.current = "";
    }
    onSend(trimmed);
    setText("");
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.overflowY = "hidden";
    }
    textareaRef.current?.focus();
  };

  const MAX_LINES = 10;
  const LINE_HEIGHT_PX = 20;
  const MAX_HEIGHT_PX = MAX_LINES * LINE_HEIGHT_PX;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.overflowY = "hidden";
    const h = Math.min(ta.scrollHeight, MAX_HEIGHT_PX);
    ta.style.height = `${h}px`;
    ta.style.overflowY = ta.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [displayValue]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-transparent px-2 py-3 sm:px-4 sm:py-4"
    >
      {/* Single row: input + [voice wave when listening] + send/mic */}
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gh-border bg-gh-bg-subtle px-3 py-2 shadow-[0_-4px_12px_-2px_var(--gh-shadow),0_4px_24px_-8px_var(--gh-shadow)] focus-within:border-gh-accent/40 focus-within:ring-1 focus-within:ring-gh-accent/20 sm:rounded-3xl sm:px-4 sm:py-3">
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => !isListening && setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={isListening ? "Listening…" : "Ask anything"}
          rows={1}
          readOnly={isListening}
          className="min-h-[40px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm leading-5 text-gh-fg placeholder:text-gh-fg-muted focus:outline-none disabled:opacity-50"
          disabled={disabled}
          aria-label="Message"
        />
        {isListening && (
          <div className="flex h-9 shrink-0 items-center">
            <VoiceWave stream={mediaStream} className="h-7 w-[120px] sm:w-[160px]" />
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {isListening ? (
            <>
              <button
                type="button"
                onClick={stopListening}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gh-danger/20 text-gh-danger hover:bg-gh-danger/30 focus:outline-none focus:ring-2 focus:ring-gh-danger focus:ring-offset-1 focus:ring-offset-gh-bg-subtle"
                aria-label="Stop recording"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={disabled || !hasText}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg-subtle disabled:opacity-50"
                aria-label="Send message"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </>
          ) : hasText ? (
            <button
              type="submit"
              disabled={disabled}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg-subtle disabled:opacity-50"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled || !speechSupported}
              onClick={startListening}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg-subtle disabled:opacity-50"
              aria-label="Start voice input"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {speechError && (
        <p className="mx-auto max-w-3xl px-3 pt-2 text-xs text-gh-danger sm:px-4" role="alert">
          {speechError}
        </p>
      )}
    </form>
  );
}
