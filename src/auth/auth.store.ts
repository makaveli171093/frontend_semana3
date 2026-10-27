import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoUser } from "@/types";

interface AuthState {
  user: DemoUser | null;
  token: string | null;
  setSession: (user: DemoUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setSession: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "solandre-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
