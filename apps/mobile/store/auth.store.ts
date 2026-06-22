import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  telephone: string | null;
  hydrated: boolean;
  setAuth: (access: string, refresh: string, role: string, telephone?: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const KEYS = {
  access: "artek_access_token",
  refresh: "artek_refresh_token",
  role: "artek_role",
  telephone: "artek_telephone",
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  role: null,
  telephone: null,
  hydrated: false,

  setAuth: async (accessToken, refreshToken, role, telephone) => {
    await SecureStore.setItemAsync(KEYS.access, accessToken);
    await SecureStore.setItemAsync(KEYS.refresh, refreshToken);
    await SecureStore.setItemAsync(KEYS.role, role);
    if (telephone) await SecureStore.setItemAsync(KEYS.telephone, telephone);
    set({ accessToken, refreshToken, role, telephone: telephone ?? null });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(KEYS.access);
    await SecureStore.deleteItemAsync(KEYS.refresh);
    await SecureStore.deleteItemAsync(KEYS.role);
    await SecureStore.deleteItemAsync(KEYS.telephone);
    set({ accessToken: null, refreshToken: null, role: null, telephone: null });
  },

  hydrate: async () => {
    const [accessToken, refreshToken, role, telephone] = await Promise.all([
      SecureStore.getItemAsync(KEYS.access),
      SecureStore.getItemAsync(KEYS.refresh),
      SecureStore.getItemAsync(KEYS.role),
      SecureStore.getItemAsync(KEYS.telephone),
    ]);
    set({
      accessToken,
      refreshToken,
      role,
      telephone,
      hydrated: true,
    });
  },
}));
