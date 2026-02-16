"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "./api";

const TOKEN_KEY = "ai_chat_token";
const EMAIL_KEY = "ai_chat_email";

type AuthContextValue = {
  token: string | null;
  email: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(getStoredToken());
    setEmail(getStoredEmail());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (emailArg: string, password: string) => {
    const { access_token } = await authApi.login({ email: emailArg, password });
    setToken(access_token);
    setEmail(emailArg);
    setStoredToken(access_token);
    setStoredEmail(emailArg);
  }, []);

  const register = useCallback(async (emailArg: string, password: string) => {
    const { access_token } = await authApi.register({ email: emailArg, password });
    setToken(access_token);
    setEmail(emailArg);
    setStoredToken(access_token);
    setStoredEmail(emailArg);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    setStoredToken(null);
    setStoredEmail(null);
  }, []);

  const value: AuthContextValue = {
    token,
    email,
    isLoading,
    login,
    register,
    logout,
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
