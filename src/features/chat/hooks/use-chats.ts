"use client";

/**
 * Chat feature: chats state hook (BLoC-like).
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/core/api";
import type { Chat } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { chatRepository } from "../repository/chat.repository";

export function useChats(currentChatId?: string) {
  const { token } = useAuth();
  const router = useRouter();
  const { showError } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refetch = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await chatRepository.list(token);
      setChats(res.chats);
    } catch (err) {
      setChats([]);
      showError(err instanceof ApiError ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createChat = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const chat = await chatRepository.create(token);
      setChats((prev) => [chat, ...prev]);
      router.push(`/chat/${chat.id}`);
      return chat;
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Failed to create chat");
    } finally {
      setLoading(false);
    }
  }, [token, router, showError]);

  const createChatWithFirstMessage = useCallback(
    async (message: string) => {
      if (!token) return;
      setSending(true);
      try {
        const chat = await chatRepository.create(token);
        setChats((prev) => [chat, ...prev]);
        // Navigate immediately so the chat opens; thread page will send the message
        const params = new URLSearchParams({ send: message });
        router.push(`/chat/${chat.id}?${params.toString()}`);
      } catch (err) {
        showError(
          err instanceof ApiError ? err.message : "Something went wrong"
        );
      } finally {
        setSending(false);
      }
    },
    [token, router, showError]
  );

  const renameChat = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!token) return;
      try {
        const updated = await chatRepository.update(token, chatId, newTitle);
        setChats((prev) =>
          prev.map((c) => (String(c.id) === String(chatId) ? updated : c))
        );
      } catch (err) {
        showError(err instanceof ApiError ? err.message : "Failed to rename chat");
      }
    },
    [token, showError]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!token) return;
      const deleted = chats.find((c) => String(c.id) === String(chatId));
      setChats((prev) => prev.filter((c) => String(c.id) !== String(chatId)));
      try {
        await chatRepository.delete(token, chatId);
      } catch (err) {
        if (deleted) setChats((prev) => [deleted, ...prev]);
        showError(err instanceof ApiError ? err.message : "Failed to delete chat");
      }
      if (String(chatId) === String(currentChatId)) {
        router.replace("/chat");
      }
    },
    [token, chats, currentChatId, router, showError]
  );

  return {
    chats,
    loading,
    sending,
    refetch,
    createChat,
    createChatWithFirstMessage,
    renameChat,
    deleteChat,
  };
}
