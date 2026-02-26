"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { chatCache } from "../cache/chat-cache";
import { useTheme } from "@/core/components/theme-provider";

export function DashboardNavbar() {
  const { logout, email } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 bg-gh-bg px-2 pt-[env(safe-area-inset-top,0px)] sm:px-4 sm:pt-0 md:absolute md:left-0 md:right-0 md:top-0 md:z-10 md:bg-transparent">
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-gh-fg-muted hover:bg-gh-bg-subtle hover:text-gh-fg"
          aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-gh-fg-muted hover:bg-gh-bg-subtle hover:text-gh-fg"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-gh-border bg-gh-bg py-2 shadow-lg"
              role="menu"
            >
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-gh-fg-muted">Email</p>
                <p
                  className="truncate text-sm text-gh-fg"
                  title={email ?? undefined}
                >
                  {email ?? "—"}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  chatCache.clearAll();
                  logout();
                  router.replace("/");
                }}
                className="w-full px-3 py-2 text-left text-sm text-gh-danger hover:bg-gh-bg-subtle"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
