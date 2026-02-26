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
import { chatCache } from "../cache/chat-cache";

export function useChats(currentChatId?: string) {
  const { token } = useAuth();
  const router = useRouter();
  const { showError } = useToast();
  const [chats, setChats] = useState<Chat[]>(() => chatCache.getChats() ?? []);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refetch = useCallback(async () => {
    if (!token) return;
    const cached = chatCache.getChats();
    if (!cached?.length) setLoading(true);
    try {
      const res = await chatRepository.list(token);
      setChats(res.chats);
      chatCache.setChats(res.chats);
    } catch (err) {
      if (!cached?.length) setChats([]);
      if (err instanceof ApiError && err.status === 401) return;
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
    setSending(true);
    if (!chatCache.getChats()?.length) setLoading(true);
    try {
      const chat = await chatRepository.create(token);
      setChats((prev) => {
        const next = [chat, ...prev];
        chatCache.setChats(next);
        return next;
      });
      router.push(`/chat/${chat.id}`);
      return chat;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      showError(err instanceof ApiError ? err.message : "Failed to create chat");
    } finally {
      setLoading(false);
      setSending(false);
    }
  }, [token, router, showError]);

  const sendMessageFromNewChat = useCallback(
    async (message: string) => {
      if (!token) return;
      setSending(true);
      try {
        const res = await chatRepository.sendMessage(token, { message });
        await refetch();
        router.push(`/chat/${res.chat_id}`);
        return res;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) throw err;
        showError(
          err instanceof ApiError ? err.message : "Something went wrong"
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [token, router, showError, refetch]
  );

  const renameChat = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!token) return;
      try {
        const updated = await chatRepository.update(token, chatId, newTitle);
        setChats((prev) => {
          const next = prev.map((c) => (String(c.id) === String(chatId) ? updated : c));
          chatCache.setChats(next);
          return next;
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        showError(err instanceof ApiError ? err.message : "Failed to rename chat");
      }
    },
    [token, showError]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!token) return;
      const deleted = chats.find((c) => String(c.id) === String(chatId));
      setChats((prev) => {
        const next = prev.filter((c) => String(c.id) !== String(chatId));
        chatCache.setChats(next);
        return next;
      });
      try {
        await chatRepository.delete(token, chatId);
      } catch (err) {
        if (deleted) setChats((prev) => {
          const next = [deleted, ...prev];
          chatCache.setChats(next);
          return next;
        });
        if (err instanceof ApiError && err.status === 401) return;
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
    sendMessageFromNewChat,
    renameChat,
    deleteChat,
  };
}
