import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { User } from "@/types";
import { useAuthStore } from "@/auth/auth.store";
import {
  getApiErrorMessage,
  loginRequest,
  registerRequest,
} from "@/auth/auth.service";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      async login(email, password) {
        try {
          const session = await loginRequest(email, password);
          setSession(session.user, session.token);
          return session.user;
        } catch (error) {
          throw new Error(getApiErrorMessage(error));
        }
      },

      async register(name, email, password, phone) {
        try {
          await registerRequest(name, email, password, phone);
        } catch (error) {
          throw new Error(getApiErrorMessage(error));
        }
      },

      logout,
    }),
    [user, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
