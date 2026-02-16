/**
 * Repository layer: Chats domain.
 * Abstracts chat & message API; single place for all chat data access.
 */

import { chatsApi, sendMessage as apiSendMessage } from "@/lib/api";
import type { Chat, Message, AIModel } from "@/types";

export const chatsRepository = {
  list: (token: string) => chatsApi.list(token),
  create: (token: string, title?: string) => chatsApi.create(token, title),
  get: (token: string, chatId: string) => chatsApi.get(token, chatId),
  getMessages: (token: string, chatId: string) =>
    chatsApi.getMessages(token, chatId),
  update: (token: string, chatId: string, title: string) =>
    chatsApi.update(token, chatId, title),
  delete: (token: string, chatId: string) => chatsApi.delete(token, chatId),

  sendMessage: (
    token: string,
    payload: {
      chat_id: string;
      message: string;
      model?: AIModel;
    }
  ) => apiSendMessage(token, payload),
};

export type { Chat, Message };
