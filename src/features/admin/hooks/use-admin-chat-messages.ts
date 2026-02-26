"use client";

/**
 * Admin feature: view any chat's messages (admin only).
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import type { Message } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { adminRepository } from "../repository/admin.repository";

export function useAdminChatMessages(chatId: string | undefined) {
  const { token } = useAuth();
  const { showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token || !chatId) return;
    setLoading(true);
    try {
      const list = await adminRepository.getChatMessages(token, chatId);
      setMessages(list);
    } catch (err) {
      setMessages([]);
      if (err instanceof ApiError && err.status === 401) return;
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

  return { messages, loading, refetch };
}
