"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { chatsApi, sendMessage } from "@/lib/api";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import type { Chat, Message } from "@/types";

export default function ChatThreadPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  const loadChats = useCallback(() => {
    if (!token) return;
    chatsApi
      .list(token)
      .then((res) => setChats(res.chats))
      .catch(() => setChats([]))
      .finally(() => setLoadingChats(false));
  }, [token]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!token || !id) return;
    setLoadingMessages(true);
    chatsApi
      .getMessages(token, id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [token, id]);

  const handleCreateChat = async () => {
    if (!token) return;
    const hasEmptyNewChat = chats.some(
      (c) => c.message_count === 0 && (!c.title || c.title.trim() === "" || c.title.trim().toLowerCase() === "new chat")
    );
    if (hasEmptyNewChat) return;
    setLoadingChats(true);
    try {
      const chat = await chatsApi.create(token);
      setChats((prev) => [chat, ...prev]);
      router.push(`/chat/${chat.id}`);
    } finally {
      setLoadingChats(false);
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

  const handleDeleteChat = async (chatId: string) => {
    if (!token) return;
    setChats((prev) => prev.filter((c) => String(c.id) !== String(chatId)));
    try {
      await chatsApi.delete(token, chatId);
    } catch {
      // ignore – UI already updated
    }
    if (chatId === id) router.replace("/chat");
  };

  const handleSend = async (message: string) => {
    if (!token || !id) return;
    setSending(true);
    const userMessage: Message = {
      id: -1,
      chat_id: id,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const res = await sendMessage(token, { chat_id: id, message });
      setMessages((prev) => [
        ...prev,
        {
          id: -2,
          chat_id: id,
          role: "assistant",
          content: res.reply,
          created_at: new Date().toISOString(),
        },
      ]);
      loadChats();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    } finally {
      setSending(false);
    }
  };

  const isEmpty = messages.length === 0 && !loadingMessages;

  return (
    <>
      <Sidebar
        chats={chats}
        onCreateChat={handleCreateChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loadingChats}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {isEmpty ? (
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
                <Composer onSend={handleSend} disabled={sending} embedded />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <MessageList
              messages={messages}
              isLoading={loadingMessages && messages.length === 0}
              isThinking={sending}
            />
            {!loadingMessages && (
              <div className="sticky bottom-0 flex-shrink-0 bg-transparent pt-2">
                <Composer onSend={handleSend} disabled={sending} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z" opacity={0.85} />
      <path d="M5 19l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z" opacity={0.7} />
    </svg>
  );
}
