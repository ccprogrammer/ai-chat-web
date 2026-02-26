"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { TOKEN_KEY, EMAIL_KEY, ROLE_KEY } from "@/core/constants/storage";
import type { UserRole } from "@/core/types";
import { authRepository } from "../repository/auth.repository";

type AuthContextValue = {
  token: string | null;
  email: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  refetchMe: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

function setStoredEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) localStorage.setItem(EMAIL_KEY, email);
  else localStorage.removeItem(EMAIL_KEY);
}

function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem(ROLE_KEY);
  return r === "admin" || r === "user" ? r : null;
}

function setStoredRole(role: UserRole | null) {
  if (typeof window === "undefined") return;
  if (role) localStorage.setItem(ROLE_KEY, role);
  else localStorage.removeItem(ROLE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    const me = await authRepository.getMe(t);
    setEmail(me.email);
    const r: UserRole = me.role === "admin" ? "admin" : "user";
    setRole(r);
    setStoredEmail(me.email);
    setStoredRole(r);
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
    setEmail(getStoredEmail());
    setRole(getStoredRole());
    if (t) {
      fetchMe(t)
        .catch(() => {
          setToken(null);
          setEmail(null);
          setRole(null);
          setStoredToken(null);
          setStoredEmail(null);
          setStoredRole(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const login = useCallback(async (emailArg: string, password: string) => {
    const { access_token } = await authRepository.login(emailArg, password);
    setToken(access_token);
    setStoredToken(access_token);
    // Redirect immediately so user reaches dashboard; fetchMe runs on next page load.
    // (If we awaited fetchMe here and it returned 401, the API client would redirect
    // back to /login, making it seem like login "didn't redirect".)
    window.location.href = "/chat";
  }, []);

  const register = useCallback(async (emailArg: string, password: string) => {
    const { access_token } = await authRepository.register(emailArg, password);
    setToken(access_token);
    setStoredToken(access_token);
    window.location.href = "/chat";
  }, []);

  const logout = useCallback(async () => {
    const t = getStoredToken();
    if (t) {
      try {
        await authRepository.logout(t);
      } catch {
        // Ignore errors (e.g. already expired); clear local state anyway
      }
    }
    setToken(null);
    setEmail(null);
    setRole(null);
    setStoredToken(null);
    setStoredEmail(null);
    setStoredRole(null);
  }, []);

  const refetchMe = useCallback(async () => {
    const t = getStoredToken();
    if (t) await fetchMe(t);
  }, [fetchMe]);

  const value: AuthContextValue = {
    token,
    email,
    role,
    isAdmin: role === "admin",
    isLoading,
    login,
    register,
    logout,
    refetchMe,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
