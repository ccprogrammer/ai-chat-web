"use client";

/**
 * Chat feature: messages state hook (BLoC-like).
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import type { Message } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { chatRepository } from "../repository/chat.repository";

export function useChatMessages(chatId: string | undefined) {
  const { token } = useAuth();
  const { showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refetch = useCallback(async () => {
    if (!token || !chatId) return;
    setLoading(true);
    try {
      const list = await chatRepository.getMessages(token, chatId);
      setMessages(list);
    } catch (err) {
      setMessages([]);
      showError(
        err instanceof ApiError ? err.message : "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  }, [token, chatId, showError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
        setMessages((prev) => [
          ...prev,
          {
            id: -2,
            chat_id: chatId,
            role: "assistant",
            content: res.reply,
            created_at: new Date().toISOString(),
          },
        ]);
        return res;
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== -1));
        showError(
          err instanceof ApiError ? err.message : "Failed to send message"
        );
      } finally {
        setSending(false);
      }
    },
    [token, chatId, showError]
  );

  return {
    messages,
    loading,
    sending,
    refetch,
    sendMessage,
  };
}
