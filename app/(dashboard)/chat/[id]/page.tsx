"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { chatsApi, sendMessage } from "@/lib/api";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import type { AIModel } from "@/types";
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
    try {
      await chatsApi.delete(token, chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (chatId === id) router.replace("/chat");
    } catch {
      // ignore
    }
  };

  const handleSend = async (message: string, model: AIModel) => {
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
      const res = await sendMessage(token, { chat_id: id, message, model });
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

  return (
    <>
      <Sidebar
        chats={chats}
        onCreateChat={handleCreateChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isLoading={loadingChats}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={loadingMessages && messages.length === 0}
          isThinking={sending}
        />
        {!loadingMessages && (
          <Composer onSend={handleSend} disabled={sending} />
        )}
      </div>
    </>
  );
}
