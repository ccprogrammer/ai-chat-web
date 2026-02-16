/**
 * Chat feature: repository layer.
 */

import { chatDatasource } from "../api/chat.datasource";

export const chatRepository = {
  list: (token: string) => chatDatasource.list(token),
  create: (token: string, title?: string) => chatDatasource.create(token, title),
  get: (token: string, chatId: string) => chatDatasource.get(token, chatId),
  getMessages: (token: string, chatId: string) =>
    chatDatasource.getMessages(token, chatId),
  update: (token: string, chatId: string, title: string) =>
    chatDatasource.update(token, chatId, title),
  delete: (token: string, chatId: string) =>
    chatDatasource.delete(token, chatId),
  sendMessage: chatDatasource.sendMessage,
};
