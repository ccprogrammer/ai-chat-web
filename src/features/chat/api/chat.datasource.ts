/**
 * Chat feature: datasource layer.
 * Raw API calls for chats, messages, send.
 */

import { request } from "@/core/api";
import type { Chat, Message, AIModel, ChatListResponse, ChatMessageResponse } from "@/core/types";

export const chatDatasource = {
  list: (token: string) =>
    request<ChatListResponse>("/chats", { token, cache: "no-store" }),

  create: (token: string, title?: string) =>
    request<Chat>("/chats", {
      method: "POST",
      token,
      body: JSON.stringify({ title: title ?? null }),
    }),

  get: (token: string, chatId: string) =>
    request<Chat>(`/chats/${chatId}`, { token }),

  getMessages: (token: string, chatId: string) =>
    request<Message[]>(`/chats/${chatId}/messages`, { token }),

  update: (token: string, chatId: string, title: string) =>
    request<Chat>(`/chats/${chatId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ title }),
    }),

  delete: (token: string, chatId: string) =>
    request<void>(`/chats/${chatId}`, { method: "DELETE", token }),

  sendMessage: (
    token: string,
    payload: {
      chat_id: string;
      message: string;
      model?: AIModel;
    }
  ) =>
    request<ChatMessageResponse>("/chat", {
      method: "POST",
      token,
      body: JSON.stringify({
        chat_id: payload.chat_id,
        message: payload.message,
        model: payload.model ?? "fast",
      }),
    }),
};
