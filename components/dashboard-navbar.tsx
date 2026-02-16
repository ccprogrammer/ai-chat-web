"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useSidebar } from "@/lib/sidebar-context";

export function DashboardNavbar() {
  const { logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toggle } = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 bg-gh-bg px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="rounded p-2 text-gh-fg-muted hover:bg-gh-bg-subtle hover:text-gh-fg"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/chat" className="text-lg font-semibold text-gh-fg">
          AI Chat
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded p-2 text-gh-fg-muted hover:bg-gh-bg-subtle hover:text-gh-fg"
          aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button type="button" onClick={() => { logout(); router.replace("/"); }} className="gh-btn text-sm">
          Sign out
        </button>
      </div>
    </header>
  );
}
