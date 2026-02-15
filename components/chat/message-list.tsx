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
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gh-fg-muted">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Send a message below to start the conversation.</p>
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
            className={`max-w-[85%] rounded-xl border px-4 py-3 ${
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
          <div className="rounded-xl border border-gh-border bg-gh-bg-subtle px-4 py-3">
            <span className="text-gh-fg-muted">Thinking…</span>
          </div>
        </li>
      )}
    </ul>
  );
}
