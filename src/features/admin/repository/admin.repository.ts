/**
 * Admin feature: repository layer.
 */

import { adminDatasource } from "../api/admin.datasource";

export const adminRepository = {
  listUsers: adminDatasource.listUsers,
  updateUserRole: adminDatasource.updateUserRole,
  getUserChats: adminDatasource.getUserChats,
  getChatMessages: adminDatasource.getChatMessages,
};
