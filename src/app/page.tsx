"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/chat");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] min-h-[100vh] items-center justify-center">
        <span className="text-gh-fg-muted">Loading…</span>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-[100dvh] min-h-[100vh] flex-col items-center justify-center gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold text-gh-fg sm:text-3xl">AI Chat</h1>
      <p className="max-w-md text-center text-gh-fg-muted">
        Multiple conversations, persistent history. Sign in or create an account
        to start.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="gh-btn">
          Sign in
        </Link>
        <Link href="/register" className="gh-btn gh-btn-primary">
          Sign up
        </Link>
      </div>
    </div>
  );
}
