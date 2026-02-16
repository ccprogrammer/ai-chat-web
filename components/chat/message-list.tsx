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

export function MessageList({ messages, isLoading, isThinking }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-4 p-3 sm:p-4">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] sm:max-w-[85%] px-3 py-2.5 sm:px-4 sm:py-3 ${
              msg.role === "user"
                ? "rounded-2xl border border-gh-border bg-gh-bg-subtle text-gh-fg"
                : "text-gh-fg"
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
          <div className="px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="text-gh-fg-muted">Thinking…</span>
          </div>
        </li>
      )}
    </ul>
  );
}
