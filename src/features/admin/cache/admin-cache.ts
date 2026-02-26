/**
 * In-memory cache for admin data.
 * Keeps previous data visible when switching pages (e.g. chat to chat).
 */

import type { User } from "@/core/types";

let usersCache: User[] | null = null;

export const adminCache = {
  getUsers: () => usersCache,
  setUsers: (users: User[]) => {
    usersCache = users;
  },
  clear: () => {
    usersCache = null;
  },
};
