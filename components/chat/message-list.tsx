"use client";

import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isThinking?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Gemini-style sparkle icon (multi-color) */
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="75%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"
        fill="url(#sparkle-grad)"
      />
      <path
        d="M19 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z"
        fill="url(#sparkle-grad)"
        opacity={0.9}
      />
      <path
        d="M5 19l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
        fill="url(#sparkle-grad)"
        opacity={0.8}
      />
    </svg>
  );
}

export function MessageList({ messages, isLoading, isThinking }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <SparkleIcon className="h-14 w-14" />
          <div>
            <h2 className="text-xl font-semibold text-gh-fg">Hi there</h2>
            <p className="mt-2 text-2xl font-medium text-gh-fg sm:text-3xl">Where should we start?</p>
          </div>
          <p className="max-w-sm text-sm text-gh-fg-muted">Type a message below or pick a model and ask anything.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
              msg.role === "user"
                ? "border-gh-accent bg-gh-accent/10 text-gh-fg"
                : "border-gh-border bg-gh-bg-subtle text-gh-fg"
            }`}
          >
            <div className="mb-1 text-xs font-medium text-gh-fg-muted">
              {msg.role === "user" ? "You" : "AI"} · {formatTime(msg.created_at)}
            </div>
            <div className="whitespace-pre-wrap break-words text-sm">{msg.content}</div>
          </div>
        </li>
      ))}
      {(isLoading || isThinking) && (
        <li className="flex justify-start">
          <div className="rounded-2xl border border-gh-border bg-gh-bg-subtle px-4 py-3">
            <span className="text-gh-fg-muted">Thinking…</span>
          </div>
        </li>
      )}
    </ul>
  );
}
