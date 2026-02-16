/**
 * Repository layer: Auth domain.
 * Abstracts auth API; single place for login, register, token handling.
 */

import { authApi } from "@/lib/api";

export const authRepository = {
  login: (email: string, password: string) =>
    authApi.login({ email, password }),

  register: (email: string, password: string) =>
    authApi.register({ email, password }),
};
