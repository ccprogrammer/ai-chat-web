/**
 * Auth feature: datasource layer.
 * Raw API calls for login, register.
 */

import { request } from "@/core/api";

export const authDatasource = {
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
