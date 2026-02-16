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

export function useAdminUsers() {
  const { token } = useAuth();
  const { showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await adminRepository.listUsers(token);
      setUsers(list);
    } catch (err) {
      setUsers([]);
      showError(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
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
