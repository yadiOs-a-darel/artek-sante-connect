import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import type { AppColors } from "@/constants/theme";
import { darkColors, lightColors } from "@/constants/theme";
import { useThemeStore, type ThemePreference } from "@/store/theme.store";

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const systemScheme = useColorScheme();

  const isDark =
    preference === "dark" || (preference === "system" && systemScheme === "dark");

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      setPreference,
    }),
    [isDark, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      colors: lightColors,
      isDark: false,
      preference: "system",
      setPreference: async () => {},
    };
  }
  return ctx;
}
