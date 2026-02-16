/**
 * Auth feature: datasource layer.
 * Raw API calls for login, register, me.
 */

import { request } from "@/core/api";
import type { User } from "@/core/types";

export const authDatasource = {
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; password: string }) =>
    request<{ id: string; email: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: (token: string) => request<User>("/auth/me", { token }),
};
