"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useSidebar } from "@/core/context/sidebar-context";
import { useAuth } from "@/features/auth";
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
  const { isAdmin } = useAuth();
  const { collapsed, toggle, close } = useSidebar();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
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
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16 md:w-16" : "w-16 md:w-64"
      }`}
    >
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        onClick={() => !collapsed && close()}
        aria-hidden="true"
      />
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden bg-gh-bg-subtle pt-[env(safe-area-inset-top)]
          transition-[width] duration-300 ease-in-out
          md:relative md:left-auto md:top-auto md:z-20 md:pt-0
          ${collapsed ? "w-16 md:w-16" : "w-[min(16rem,85vw)] max-w-64 md:w-64"}
        `}
      >
        {/* Chevron in fixed 64px strip - never moves during open/close */}
        <div className="flex shrink-0 flex-row">
          <div className="flex w-16 shrink-0 flex-col items-center py-1.5">
            <button
            type="button"
            onClick={toggle}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-gh-fg-muted hover:bg-gh-border-muted hover:text-gh-fg"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            )}
          </button>
          </div>
          {/* Spacer when expanded - chevron strip stays fixed, this grows */}
          {!collapsed && <div className="min-w-0 flex-1" />}
        </div>
        {/* Fixed-width content prevents text reflow/folding; mask reveals left-to-right */}
        <nav
          className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto
            [mask-image:linear-gradient(to_right,black_50%,transparent_50%)] [mask-size:200%_100%] [mask-repeat:no-repeat]
            transition-[opacity,mask-position] duration-300 ease-out ${
            collapsed
              ? "opacity-0 pointer-events-none overflow-hidden [mask-position:100%_0] delay-0"
              : "opacity-100 [mask-position:0_0] delay-0"
          }`}
        >
          <div className="w-48 shrink-0 pl-2 pr-2 py-1.5 pt-0 sm:pl-3 sm:pr-3 sm:py-2 sm:pt-0">
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
                      isActive ? "bg-gh-border-muted font-medium" : ""
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
      </aside>
    </div>
  );
}
