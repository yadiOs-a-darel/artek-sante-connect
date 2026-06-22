import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "artek-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

// Appliquer au chargement du module (avant React)
const stored = localStorage.getItem("artek-theme");
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    applyTheme(state?.theme ?? "dark");
  } catch {
    applyTheme("dark");
  }
} else {
  applyTheme("dark");
}
