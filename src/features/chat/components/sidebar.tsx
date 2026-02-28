"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useSidebar } from "@/core/context/sidebar-context";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/core/components/theme-provider";
import { chatCache } from "../cache/chat-cache";
import { Spinner } from "@/core/components/spinner";
import { SidebarUsers } from "@/features/admin/components/sidebar-users";
import type { Chat } from "@/core/types";

interface SidebarProps {
  chats: Chat[];
  /** Called when "+ New chat" is clicked. Typically navigates to /chat. */
  onNewChat: () => void;
  onRenameChat?: (id: string, newTitle: string) => void | Promise<void>;
  onDeleteChat?: (id: string) => void | Promise<void>;
  canDeleteChat?: (chat: Chat) => boolean;
  isLoading?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function Sidebar({
  chats,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  canDeleteChat,
  isLoading,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout, email } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggle, close } = useSidebar();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuPopoverRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) close();
  }, [pathname, close]);

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) close();
  };

  useEffect(() => {
    if (!menuOpenId) return;
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpenId(null);
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [menuOpenId]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const closeUserMenu = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        userMenuRef.current?.contains(target) ||
        userMenuPopoverRef.current?.contains(target)
      )
        return;
      setUserMenuOpen(false);
    };
    document.addEventListener("click", closeUserMenu);
    return () => document.removeEventListener("click", closeUserMenu);
  }, [userMenuOpen]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const handleRenameClick = (chat: Chat) => {
    setMenuOpenId(null);
    setEditingId(chat.id);
    setEditingTitle(chat.title?.trim() || "New chat");
  };

  const handleRenameSave = async (chatId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed || !onRenameChat) {
      setEditingId(null);
      return;
    }
    setSavingId(chatId);
    try {
      await onRenameChat(chatId, trimmed);
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleRenameCancel = () => {
    setEditingId(null);
  };

  const handleDeleteClick = async (chatId: string) => {
    setMenuOpenId(null);
    if (
      onDeleteChat &&
      (typeof window === "undefined" || window.confirm("Delete this chat?"))
    ) {
      await onDeleteChat(chatId);
    }
  };

  return (
    <div
      className={`flex shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out
        h-12 w-full md:h-full md:min-h-0
        ${collapsed ? "md:w-12" : "md:w-64"}
      `}
    >
      {/* Mobile: fixed top bar with chevron - always visible */}
      <div
        className="fixed left-0 right-0 top-0 z-[60] flex h-12 shrink-0 items-center bg-gh-bg-subtle px-1.5 pt-[env(safe-area-inset-top)] md:hidden"
        aria-hidden="true"
      >
        <button
          type="button"
          onClick={toggle}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-1.5 text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        onClick={() => !collapsed && close()}
        aria-hidden="true"
      />
      <aside
        className={`
          flex flex-col overflow-hidden bg-gh-bg-subtle
          max-md:will-change-transform
          transition-[transform,width] duration-300 ease-out
          md:relative md:top-auto md:z-20 md:h-full md:pt-0 md:transition-[width] md:will-change-auto
          max-md:fixed max-md:left-0 max-md:top-12 max-md:z-50 max-md:h-[calc(100dvh-3rem)] max-md:w-[min(16rem,85vw)] max-md:max-w-64 max-md:pt-0
          ${collapsed
            ? "max-md:-translate-x-full max-md:pointer-events-none md:w-12"
            : "max-md:translate-x-0 md:w-64"
          }
        `}
      >
        {/* Top row: chevron + spacer - desktop only (mobile has separate top bar) */}
        <div className="hidden shrink-0 flex-row px-1.5 py-1.5 md:flex">
          <div className="flex shrink-0 items-center">
            <button
            type="button"
            onClick={toggle}
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-1.5 text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            )}
          </button>
          </div>
          {!collapsed && <div className="min-w-0 flex-1" />}
        </div>
        {/* Fixed-width content; mask for desktop collapsed animation; on mobile drawer show all */}
        <nav
          className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto
            max-md:[mask-image:none]
            md:[mask-image:linear-gradient(to_right,black_50%,transparent_50%)] md:[mask-size:200%_100%] md:[mask-repeat:no-repeat]
            transition-[opacity,mask-position] duration-300 ease-out ${
            collapsed
              ? "opacity-0 pointer-events-none overflow-hidden md:[mask-position:100%_0] delay-0"
              : "opacity-100 md:[mask-position:0_0] delay-0"
          }`}
        >
          <div className="w-52 shrink-0 px-1.5 py-1.5 pt-0 sm:pr-3 sm:py-2 sm:pt-0">
              <button
                type="button"
                onClick={onNewChat}
                className="mb-2 flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gh-fg hover:bg-gh-border-muted"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New chat</span>
              </button>
          {chats.length === 0 && !isLoading && (
            <p className="px-2 py-4 text-sm text-gh-fg-muted">
              No chats yet. Start one above.
            </p>
          )}
          <ul className="space-y-0.5">
            {chats.map((chat) => {
              const href = `/chat/${chat.id}`;
              const isActive = pathname === href;
              const title = chat.title?.trim() || "New chat";
              const isEditing = editingId === chat.id;

              if (isEditing) {
                return (
                  <li
                    key={chat.id}
                    className="rounded-lg border border-gh-accent bg-gh-bg p-2"
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSave(chat.id);
                        if (e.key === "Escape") handleRenameCancel();
                      }}
                      className="gh-input mb-2 w-full text-sm"
                      placeholder="Chat title"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleRenameSave(chat.id)}
                        disabled={savingId === chat.id}
                        className="gh-btn gh-btn-primary flex flex-1 items-center justify-center gap-1.5 text-xs disabled:opacity-70"
                      >
                        {savingId === chat.id ? (
                          <>
                            <Spinner className="h-3 w-3" />
                            Saving…
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRenameCancel}
                        disabled={savingId === chat.id}
                        className="gh-btn flex-1 text-xs disabled:opacity-70"
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={chat.id} className="group relative">
                  <Link
                    href={href}
                    onClick={handleLinkClick}
                    className={`block rounded-lg px-3 py-2 pr-9 text-sm text-gh-fg hover:bg-gh-border-muted ${
                      isActive ? "bg-gh-border-muted" : ""
                    }`}
                  >
                    <span className="block truncate">{title}</span>
                    <span className="mt-0.5 block text-xs text-gh-fg-muted">
                      {formatDate(chat.updated_at)} · {chat.message_count}{" "}
                      messages
                    </span>
                  </Link>
                  <div
                    className="absolute right-1 top-2"
                    ref={menuOpenId === chat.id ? menuRef : null}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpenId((prev) =>
                          prev === chat.id ? null : chat.id
                        );
                      }}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-1.5 text-gh-fg-muted opacity-0 hover:bg-gh-border hover:text-gh-fg group-hover:opacity-100 [@media(hover:none)]:opacity-70"
                      aria-label="Chat options"
                      aria-expanded={menuOpenId === chat.id}
                      aria-haspopup="true"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </button>
                    {menuOpenId === chat.id && (
                      <div
                        className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-gh-border bg-gh-bg py-1 shadow-lg"
                        role="menu"
                      >
                        {onRenameChat && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleRenameClick(chat)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gh-fg hover:bg-gh-bg-subtle"
                          >
                            Rename
                          </button>
                        )}
                        {onDeleteChat && canDeleteChat?.(chat) !== false && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleDeleteClick(chat.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gh-danger hover:bg-gh-bg-subtle"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {isAdmin && <SidebarUsers />}
          </div>
        </nav>
        {/* Footer */}
        <div
          className={`flex shrink-0 flex-col gap-0.5 px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
            collapsed ? "" : "sm:pr-3"
          }`}
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-[32px] w-full min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg"
            aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              {theme === "dark" ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
            <span
              className={`min-w-0 overflow-hidden text-xs transition-opacity duration-300 ease-out ${
                collapsed ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              Theme
            </span>
          </button>
          <div className="relative w-full" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex min-h-[32px] w-full min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg"
              aria-label="Account menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              {userMenuOpen &&
                typeof document !== "undefined" &&
                userMenuRef.current &&
                createPortal(
                  <div
                    ref={userMenuPopoverRef}
                    className="fixed z-50 min-w-[200px] rounded-lg border border-gh-border bg-gh-bg py-2 shadow-lg"
                    role="menu"
                    style={{
                      left: userMenuRef.current.getBoundingClientRect().left,
                      top: userMenuRef.current.getBoundingClientRect().top - 8,
                      transform: "translateY(-100%)",
                    }}
                  >
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-gh-fg-muted">Email</p>
                      <p className="truncate text-sm text-gh-fg" title={email ?? undefined}>
                        {email ?? "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        chatCache.clearAll();
                        await logout();
                        router.replace("/");
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gh-danger hover:bg-gh-bg-subtle"
                    >
                      Sign out
                    </button>
                  </div>,
                  document.body
                )}
            <span
              className={`min-w-0 overflow-hidden text-xs transition-opacity duration-300 ease-out ${
                collapsed ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              Account
            </span>
          </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
