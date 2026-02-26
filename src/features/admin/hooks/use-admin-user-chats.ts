"use client";

/**
 * Admin feature: view a user's chats (admin only).
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import type { Chat } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { adminRepository } from "../repository/admin.repository";

export function useAdminUserChats(userId: string | undefined) {
  const { token } = useAuth();
  const { showError } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const res = await adminRepository.getUserChats(token, userId);
      setChats(res.chats);
    } catch (err) {
      setChats([]);
      if (err instanceof ApiError && err.status === 401) return;
      showError(
        err instanceof ApiError ? err.message : "Failed to load user chats"
      );
    } finally {
      setLoading(false);
    }
  }, [token, userId, showError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { chats, loading, refetch };
}
