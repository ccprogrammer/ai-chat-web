"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useSidebar } from "@/lib/sidebar-context";
import type { Chat } from "@/types";

interface SidebarProps {
  chats: Chat[];
  onCreateChat: () => void;
  onRenameChat?: (id: string, newTitle: string) => void | Promise<void>;
  onDeleteChat?: (id: string) => void | Promise<void>;
  /** When false for a chat, Delete is hidden (e.g. last empty chat). Default: true */
  canDeleteChat?: (chat: Chat) => boolean;
  isLoading?: boolean;
  /** When true, New chat button is disabled (e.g. when no chats yet—user must send a message to create one). */
  createChatDisabled?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function Sidebar({ chats, onCreateChat, onRenameChat, onDeleteChat, canDeleteChat, isLoading, createChatDisabled }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, close } = useSidebar();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) close();
  }, [pathname, close]);

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) close();
  };
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpenId(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
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
    await onRenameChat(chatId, trimmed);
    setEditingId(null);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
  };

  const handleDeleteClick = async (chatId: string) => {
    setMenuOpenId(null);
    if (onDeleteChat && (typeof window === "undefined" || window.confirm("Delete this chat?"))) {
      await onDeleteChat(chatId);
    }
  };

  return (
    <div
      className={`flex h-full min-h-0 w-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out ${collapsed ? "md:w-0" : "md:w-64"}`}
    >
      {/* Mobile: backdrop when sidebar open */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        onClick={() => !collapsed && close()}
        aria-hidden="true"
      />
      {/* Sidebar: overlay on mobile, full-height column on desktop */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-64 flex-col overflow-hidden border-r border-gh-border bg-gh-bg-subtle
          transition-[transform,width] duration-300 ease-in-out
          md:relative md:left-auto md:top-auto md:z-auto md:h-full md:w-64
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-0" : "translate-x-0"}
        `}
      >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gh-border px-3 sm:px-4">
        <span className="text-sm font-medium text-gh-fg">Chats</span>
        <button
          type="button"
          onClick={onCreateChat}
          disabled={isLoading || createChatDisabled}
          className="gh-btn text-xs"
        >
          New chat
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-1.5 sm:p-2">
        {chats.length === 0 && !isLoading && (
          <p className="px-2 py-4 text-sm text-gh-fg-muted">No chats yet. Start one above.</p>
        )}
        <ul className="space-y-0.5">
          {chats.map((chat) => {
            const href = `/chat/${chat.id}`;
            const isActive = pathname === href;
            const title = chat.title?.trim() || "New chat";
            const isEditing = editingId === chat.id;

            if (isEditing) {
              return (
                <li key={chat.id} className="rounded-lg border border-gh-accent bg-gh-bg p-2">
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
                      className="gh-btn gh-btn-primary flex-1 text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleRenameCancel}
                      className="gh-btn flex-1 text-xs"
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
                    {formatDate(chat.updated_at)} · {chat.message_count} messages
                  </span>
                </Link>
                <div className="absolute right-1 top-2" ref={menuOpenId === chat.id ? menuRef : null}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpenId((prev) => (prev === chat.id ? null : chat.id));
                    }}
                    className="rounded p-1.5 text-gh-fg-muted opacity-0 hover:bg-gh-border hover:text-gh-fg group-hover:opacity-100"
                    aria-label="Chat options"
                    aria-expanded={menuOpenId === chat.id}
                    aria-haspopup="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
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
      </nav>
    </aside>
    </div>
  );
}
