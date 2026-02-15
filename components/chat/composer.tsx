"use client";

import { useRef, useState, useEffect } from "react";
import type { AIModel } from "@/types";

const MODELS: { value: AIModel; label: string; description: string }[] = [
  { value: "fast", label: "Fast", description: "Quick responses, lower cost" },
  { value: "balanced", label: "Balanced", description: "Speed and quality in balance" },
  { value: "smart", label: "Smart", description: "Best for complex tasks" },
];

interface ComposerProps {
  onSend: (message: string, model: AIModel) => void;
  disabled?: boolean;
  /** When true, no top border or background (for centering below greeting) */
  embedded?: boolean;
}

export function Composer({ onSend, disabled, embedded }: ComposerProps) {
  const [text, setText] = useState("");
  const [model, setModel] = useState<AIModel>("fast");
  const [modelOpen, setModelOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modelOpen) return;
    const close = (e: MouseEvent) => {
      if (modelRef.current?.contains(e.target as Node)) return;
      setModelOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [modelOpen]);

  useEffect(() => {
    if (!plusOpen) return;
    const close = (e: MouseEvent) => {
      if (plusRef.current?.contains(e.target as Node)) return;
      setPlusOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [plusOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, model);
    setText("");
    textareaRef.current?.focus();
  };

  const hasText = text.trim().length > 0;
  const current = MODELS.find((m) => m.value === model) ?? MODELS[0];

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "bg-transparent px-0 py-2"
          : "bg-transparent px-4 py-4"
      }
    >
      {/* Gemini-style capsule: text area on top, controls bar on bottom */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-gh-border bg-gh-bg-subtle shadow-[0_-4px_12px_-2px_var(--gh-shadow),0_4px_24px_-8px_var(--gh-shadow)] focus-within:border-gh-accent/40 focus-within:ring-1 focus-within:ring-gh-accent/20">
        {/* Top: text input only */}
        <div className="px-4 pt-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything"
            rows={2}
            className="min-h-[56px] max-h-[200px] w-full resize-none bg-transparent text-sm text-gh-fg placeholder:text-gh-fg-muted focus:outline-none disabled:opacity-50"
            disabled={disabled}
            aria-label="Message"
          />
        </div>

        {/* Bottom bar: +, Tools | Model dropdown, Mic */}
        <div className="flex items-center justify-between border-t border-gh-border px-2 py-2">
          <div className="flex items-center gap-0.5">
            <div className="relative" ref={plusRef}>
              <button
                type="button"
                onClick={() => !disabled && setPlusOpen((o) => !o)}
                disabled={disabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted transition-colors hover:bg-gh-border-muted hover:text-gh-fg disabled:opacity-50"
                aria-label="Attach or more options"
                aria-expanded={plusOpen}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              {plusOpen && (
                <div className="absolute left-0 bottom-full z-20 mb-1 min-w-[200px] rounded-xl border border-gh-border bg-gh-bg py-2 shadow-lg">
                  <div className="px-3 py-1.5 text-xs font-medium text-gh-fg-muted">Attach file (coming soon)</div>
                </div>
              )}
            </div>
            <button
              type="button"
              disabled
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg disabled:opacity-50"
              aria-label="Tools (coming soon)"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Tools</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative" ref={modelRef}>
              <button
                type="button"
                onClick={() => !disabled && setModelOpen((o) => !o)}
                disabled={disabled}
                className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm text-gh-fg-muted transition-colors hover:bg-gh-border-muted hover:text-gh-fg disabled:opacity-50"
                aria-haspopup="listbox"
                aria-expanded={modelOpen}
              >
                {current.label}
                <svg className={`h-4 w-4 transition-transform ${modelOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {modelOpen && (
                <div
                  className="absolute right-0 bottom-full z-20 mb-1 min-w-[240px] max-h-[280px] overflow-auto rounded-xl border border-gh-border bg-gh-bg py-2 shadow-lg"
                  role="listbox"
                >
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      role="option"
                      aria-selected={model === m.value}
                      onClick={() => {
                        setModel(m.value);
                        setModelOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gh-bg-subtle focus:outline-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gh-fg">{m.label}</div>
                        <div className="mt-0.5 text-xs text-gh-fg-muted">{m.description}</div>
                      </div>
                      {model === m.value && (
                        <svg className="h-5 w-5 shrink-0 text-gh-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {hasText ? (
              <button
                type="submit"
                disabled={disabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg-subtle disabled:opacity-50"
                aria-label="Send message"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gh-fg-muted disabled:opacity-50"
                aria-label="Voice input (coming soon)"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
