"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_EXPIRED_EVENT } from "@/core/api";
import { useAuth } from "@/features/auth";

export function SessionExpiredPopup() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const handle = () => setOpen(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, handle);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handle);
  }, []);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    logout();
    router.replace("/login");
  }, [router, logout]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-gh-border bg-gh-bg p-4 shadow-lg">
        <h2
          id="session-expired-title"
          className="text-sm font-medium text-gh-fg"
        >
          Session expired
        </h2>
        <p className="mt-2 text-sm text-gh-fg-muted">
          Your session has expired or you have been signed out. Please sign in
          again.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="gh-btn gh-btn-primary px-3 py-1.5 text-sm"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
