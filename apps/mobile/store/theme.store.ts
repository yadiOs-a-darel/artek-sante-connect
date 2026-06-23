import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
  hydrate: () => Promise<void>;
}

const KEY = "artek_theme_preference";

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  hydrated: false,

  setPreference: async (preference) => {
    await SecureStore.setItemAsync(KEY, preference);
    set({ preference });
  },

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        set({ preference: stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
