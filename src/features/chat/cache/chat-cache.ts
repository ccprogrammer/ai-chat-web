/**
 * In-memory cache for chats and messages.
 * Keeps previous data visible when switching tabs or refetching.
 */

import type { Chat, Message } from "@/core/types";

let chatListCache: Chat[] | null = null;
const messagesCache = new Map<string, Message[]>();

export const chatCache = {
  getChats: () => chatListCache,
  setChats: (chats: Chat[]) => {
    chatListCache = chats;
  },
  clearChats: () => {
    chatListCache = null;
  },

  getMessages: (chatId: string) => messagesCache.get(chatId) ?? null,
  setMessages: (chatId: string, messages: Message[]) => {
    messagesCache.set(chatId, messages);
  },
  clearMessages: (chatId?: string) => {
    if (chatId) messagesCache.delete(chatId);
    else messagesCache.clear();
  },

  clearAll: () => {
    chatListCache = null;
    messagesCache.clear();
  },
};
