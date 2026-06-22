import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  setAuth: (access: string, refresh: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      setAuth: (accessToken, refreshToken, role) =>
        set({ accessToken, refreshToken, role }),
      logout: () => set({ accessToken: null, refreshToken: null, role: null }),
    }),
    { name: "artek-auth" }
  )
);
