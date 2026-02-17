"use client";

import { useRef, useState, useEffect } from "react";

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  /** When true, no top border or background (for centering below greeting) */
  embedded?: boolean;
}

export function Composer({ onSend, disabled, embedded }: ComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.overflowY = "hidden";
    }
    textareaRef.current?.focus();
  };

  const hasText = text.trim().length > 0;

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
  }, [text]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-transparent px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-4 sm:pb-4"
    >
      <div className="mx-auto flex max-w-3xl min-w-0 items-end gap-2 rounded-2xl border border-gh-border bg-gh-bg-subtle px-3 py-2 shadow-[0_-4px_12px_-2px_var(--gh-shadow),0_4px_24px_-8px_var(--gh-shadow)] focus-within:border-gh-accent/40 focus-within:ring-1 focus-within:ring-gh-accent/20 sm:rounded-3xl sm:px-4 sm:py-3">
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
          rows={1}
          className="min-h-[40px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm leading-5 text-gh-fg placeholder:text-gh-fg-muted focus:outline-none disabled:opacity-50"
          disabled={disabled}
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={disabled || !hasText}
          className="flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg focus:outline-none focus:ring-2 focus:ring-gh-accent focus:ring-offset-1 focus:ring-offset-gh-bg-subtle disabled:opacity-50 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
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
      </div>
    </form>
  );
}
