/**
 * Auth feature: repository layer.
 */

import { authDatasource } from "../api/auth.datasource";

export const authRepository = {
  login: (email: string, password: string) =>
    authDatasource.login({ email, password }),

  register: (email: string, password: string) =>
    authDatasource.register({ email, password }),
};
