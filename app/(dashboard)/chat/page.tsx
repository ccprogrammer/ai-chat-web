"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { chatsApi, sendMessage } from "@/lib/api";
import { Sidebar } from "@/components/chat/sidebar";
import { Composer } from "@/components/chat/composer";
import type { AIModel } from "@/types";
import type { Chat } from "@/types";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z" opacity={0.85} />
      <path d="M5 19l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z" opacity={0.7} />
    </svg>
  );
}

export default function ChatIndexPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadChats = useCallback(() => {
    if (!token) return;
    chatsApi
      .list(token)
      .then((res) => setChats(res.chats))
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleCreateChat = async () => {
    if (!token) return;
    const emptyNewChat = chats.find(
      (c) => c.message_count === 0 && (!c.title || c.title.trim() === "" || c.title.trim().toLowerCase() === "new chat")
    );
    if (emptyNewChat) {
      router.push(`/chat/${emptyNewChat.id}`);
      return;
    }
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

  const handleSendFromPlaceholder = async (message: string, model: AIModel) => {
    if (!token) return;
    setSending(true);
    try {
      const chat = await chatsApi.create(token);
      setChats((prev) => [chat, ...prev]);
      await sendMessage(token, { chat_id: chat.id, message, model });
      router.push(`/chat/${chat.id}`);
    } catch {
      setSending(false);
    } finally {
      setSending(false);
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
    const removed = chats.find((c) => String(c.id) === String(id));
    setChats((prev) => prev.filter((c) => String(c.id) !== String(id)));
    if (typeof window !== "undefined" && window.location.pathname === `/chat/${id}`) {
      router.replace("/chat");
    }
    try {
      await chatsApi.delete(token, id);
    } catch {
      if (removed) setChats((prev) => [removed, ...prev]);
    }
  };

  return (
    <>
      <Sidebar
        chats={chats}
        onCreateChat={handleCreateChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loading}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="flex w-full max-w-2xl flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <SparkleIcon className="h-14 w-14 text-gh-accent" />
              <div>
                <h2 className="text-xl font-semibold text-gh-fg">Hi there</h2>
                <p className="mt-2 text-2xl font-medium text-gh-fg sm:text-3xl">Where should we start?</p>
              </div>
            </div>
            <div className="w-full max-w-3xl">
              <Composer onSend={handleSendFromPlaceholder} disabled={sending} embedded />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
