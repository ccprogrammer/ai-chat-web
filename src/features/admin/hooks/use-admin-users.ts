"use client";

/**
 * Admin feature: users list hook.
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import type { User } from "@/core/types";
import { useAuth } from "@/features/auth";
import { useToast } from "@/core/context/toast-context";
import { adminRepository } from "../repository/admin.repository";
import { adminCache } from "../cache/admin-cache";

export function useAdminUsers() {
  const { token } = useAuth();
  const { showError } = useToast();
  const [users, setUsers] = useState<User[]>(() => adminCache.getUsers() ?? []);
  const [loading, setLoading] = useState(!adminCache.getUsers());

  const refetch = useCallback(async () => {
    if (!token) return;
    const cached = adminCache.getUsers();
    if (!cached?.length) setLoading(true);
    try {
      const list = await adminRepository.listUsers(token);
      setUsers(list);
      adminCache.setUsers(list);
    } catch (err) {
      setUsers((prev) => (cached?.length ? prev : []));
      showError(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    const cached = adminCache.getUsers();
    setUsers(cached ?? []);
    setLoading(!cached?.length);
    refetch();
  }, [refetch]);

  const updateRole = useCallback(
    async (userId: string, role: "user" | "admin") => {
      if (!token) return;
      try {
        const updated = await adminRepository.updateUserRole(token, userId, role);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? updated : u))
        );
        return updated;
      } catch (err) {
        showError(
          err instanceof ApiError ? err.message : "Failed to update role"
        );
      }
    },
    [token, showError]
  );

  return { users, loading, refetch, updateRole };
}
