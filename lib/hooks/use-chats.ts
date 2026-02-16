"use client";

/**
 * State layer: Chats hook (BLoC-like).
 * Manages chat list state, loading, and actions via repository.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import { chatsRepository } from "@/lib/repositories/chats.repository";
import type { Chat } from "@/types";

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
      const res = await chatsRepository.list(token);
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
      const chat = await chatsRepository.create(token);
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
        const chat = await chatsRepository.create(token);
        setChats((prev) => [chat, ...prev]);
        await chatsRepository.sendMessage(token, {
          chat_id: chat.id,
          message,
        });
        router.push(`/chat/${chat.id}`);
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
        const updated = await chatsRepository.update(token, chatId, newTitle);
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
        await chatsRepository.delete(token, chatId);
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
