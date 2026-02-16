/**
 * Admin feature: datasource layer.
 * Admin-only API calls.
 */

import { request } from "@/core/api";
import type { User } from "@/core/types";
import type { Chat, Message } from "@/core/types";
import type { ChatListResponse } from "@/core/types";

export const adminDatasource = {
  listUsers: (token: string, params?: { limit?: number; offset?: number }) =>
    request<User[]>(
      `/admin/users?limit=${params?.limit ?? 100}&offset=${params?.offset ?? 0}`,
      { token }
    ),

  updateUserRole: (
    token: string,
    userId: string,
    role: "user" | "admin"
  ) =>
    request<User>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ role }),
    }),

  getUserChats: (
    token: string,
    userId: string,
    params?: { limit?: number; offset?: number }
  ) =>
    request<ChatListResponse>(
      `/admin/users/${userId}/chats?limit=${params?.limit ?? 50}&offset=${params?.offset ?? 0}`,
      { token }
    ),

  getChatMessages: (
    token: string,
    chatId: string,
    params?: { limit?: number }
  ) =>
    request<Message[]>(
      `/admin/chats/${chatId}/messages?limit=${params?.limit ?? 500}`,
      { token }
    ),
};
