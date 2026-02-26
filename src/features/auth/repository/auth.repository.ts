/**
 * Auth feature: repository layer.
 */

import { authDatasource } from "../api/auth.datasource";

export const authRepository = {
  login: (email: string, password: string) =>
    authDatasource.login({ email, password }),

  register: async (email: string, password: string) => {
    await authDatasource.register({ email, password });
    return authDatasource.login({ email, password });
  },

  getMe: (token: string) => authDatasource.getMe(token),

  logout: (token: string) => authDatasource.logout(token),
};
