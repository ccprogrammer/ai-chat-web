"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { chatsApi } from "@/lib/api";
import { Sidebar } from "@/components/chat/sidebar";
import type { Chat } from "@/types";

export default function ChatIndexPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    chatsApi
      .list(token)
      .then((res) => setChats(res.chats))
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreateChat = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const chat = await chatsApi.create(token);
      setChats((prev) => [chat, ...prev]);
      router.push(`/chat/${chat.id}`);
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (!token) return;
    try {
      const updated = await chatsApi.update(token, chatId, newTitle);
      setChats((prev) => prev.map((c) => (c.id === chatId ? updated : c)));
    } catch {
      // ignore
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!token) return;
    try {
      await chatsApi.delete(token, id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (typeof window !== "undefined" && window.location.pathname === `/chat/${id}`) {
        router.replace("/chat");
      }
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Sidebar
        chats={chats}
        onCreateChat={handleCreateChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isLoading={loading}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gh-fg-muted">
        <p className="text-sm">Select a chat or create a new one.</p>
        <button type="button" onClick={handleCreateChat} className="gh-btn gh-btn-primary" disabled={loading}>
          New chat
        </button>
      </div>
    </>
  );
}
