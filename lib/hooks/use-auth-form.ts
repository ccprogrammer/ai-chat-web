"use client";

/**
 * State layer: Auth form hook (BLoC-like).
 * Manages login/register form state, loading, error via auth context.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type AuthFormMode = "login" | "register";

export function useAuthForm(mode: AuthFormMode) {
  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();
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
        router.replace("/chat");
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
    [email, password, mode, login, register, router]
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
