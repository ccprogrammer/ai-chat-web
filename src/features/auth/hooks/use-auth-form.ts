"use client";

/**
 * Auth feature: form state hook (BLoC-like).
 */

import { useCallback, useState } from "react";
import { ApiError } from "@/core/api";
import { useAuth } from "../context/auth-context";

type AuthFormMode = "login" | "register";

export function useAuthForm(mode: AuthFormMode) {
  const { login, register, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        if (mode === "login") {
          await login(email, password);
        } else {
          await register(email, password);
        }
        // Both login and register do window.location.href = "/chat" and navigate away
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : mode === "login"
              ? "Login failed"
              : "Registration failed"
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, login, register]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    isAuthenticated,
  };
}
