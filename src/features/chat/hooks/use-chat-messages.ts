"use client";

/**
 * Chat feature: messages state hook (BLoC-like).
 * Optimistic updates: user message shows immediately, "Thinking..." while API loads.
 * Uses cache so switching tabs never shows empty during refetch.
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import type { Message } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { chatRepository } from "../repository/chat.repository";
import { chatCache } from "../cache/chat-cache";

export function useChatMessages(chatId: string | undefined) {
  const { token } = useAuth();
  const { showError } = useToast();
  const [messages, setMessages] = useState<Message[]>(() =>
    chatId ? (chatCache.getMessages(chatId) ?? []) : [],
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refetch = useCallback(async () => {
    if (!token || !chatId) return;
    const cached = chatCache.getMessages(chatId);
    if (!cached?.length) setLoading(true);
    try {
      const list = await chatRepository.getMessages(token, chatId);
      setMessages((prev) => {
        if (prev.some((m) => m.id < 0)) return prev;
        chatCache.setMessages(chatId, list);
        return list;
      });
    } catch (err) {
      setMessages((prev) => {
        if (prev.some((m) => m.id < 0)) return prev;
        return cached?.length ? prev : [];
      });
      if (err instanceof ApiError && err.status === 401) return;
      showError(
        err instanceof ApiError ? err.message : "Failed to load messages",
      );
    } finally {
      setLoading(false);
    }
  }, [token, chatId, showError]);

  useEffect(() => {
    if (!chatId) return;
    const cached = chatCache.getMessages(chatId);
    setMessages(cached ?? []);
    setLoading(!cached?.length);
    refetch();
  }, [chatId, refetch]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!token || !chatId) return;
      const userMessage: Message = {
        id: -1,
        chat_id: chatId,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setSending(true);
      try {
        const res = await chatRepository.sendMessage(token, {
          chat_id: chatId,
          message,
        });
        const assistantMessage: Message = {
          id: -2,
          chat_id: chatId,
          role: "assistant",
          content: res.reply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, assistantMessage];
          chatCache.setMessages(chatId, next);
          return next;
        });
        return res;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return; // Keep optimistic message visible; session expired popup will show
        }
        setMessages((prev) => prev.filter((m) => m.id !== -1));
        showError(
          err instanceof ApiError ? err.message : "Failed to send message",
        );
      } finally {
        setSending(false);
      }
    },
    [token, chatId, showError],
  );

  return {
    messages,
    loading,
    sending,
    refetch,
    sendMessage,
  };
}
