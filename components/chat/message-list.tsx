"use client";

import { useRef, useEffect } from "react";
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
  const lastUserMessageRef = useRef<HTMLLIElement>(null);

  const lastUserIndex = (() => {
    let idx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        idx = i;
        break;
      }
    }
    return idx;
  })();

  useEffect(() => {
    if (messages.length > 0 && lastUserIndex >= 0) {
      lastUserMessageRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [messages.length, lastUserIndex]);

  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-4 p-3 sm:p-4">
      {messages.map((msg, index) => (
        <li
          key={msg.id}
          ref={index === lastUserIndex ? lastUserMessageRef : undefined}
          className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] sm:max-w-[85%] rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 ${
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
          <div className="rounded-2xl border border-gh-border bg-gh-bg-subtle px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="text-gh-fg-muted">Thinking…</span>
          </div>
        </li>
      )}
    </ul>
  );
}
