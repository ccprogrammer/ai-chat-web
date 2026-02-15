"use client";

import { useRef, useState } from "react";
import type { AIModel } from "@/types";

const MODELS: { value: AIModel; label: string }[] = [
  { value: "fast", label: "Fast" },
  { value: "balanced", label: "Balanced" },
  { value: "smart", label: "Smart" },
];

interface ComposerProps {
  onSend: (message: string, model: AIModel) => void;
  disabled?: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const [model, setModel] = useState<AIModel>("fast");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, model);
    setText("");
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gh-border bg-gh-bg p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-gh-fg-muted" aria-hidden>Model</span>
        <div
          className="inline-flex rounded-lg border border-gh-border bg-gh-bg-subtle p-0.5"
          role="group"
          aria-label="Model"
        >
          {MODELS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setModel(m.value)}
              disabled={disabled}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg disabled:opacity-50 ${
                model === m.value
                  ? "bg-gh-bg text-gh-fg shadow-sm ring-1 ring-gh-border"
                  : "text-gh-fg-muted hover:text-gh-fg"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type a message…"
          rows={2}
          className="gh-input min-h-[80px] resize-none"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="gh-btn gh-btn-primary self-end"
        >
          Send
        </button>
      </div>
    </form>
  );
}
