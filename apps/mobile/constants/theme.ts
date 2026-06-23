export const palette = {
  green: "#00A651",
  blue: "#0066B3",
  orange: "#F7941D",
  danger: "#EF4444",
} as const;

export const lightColors = {
  ...palette,
  bg: "#F9FAFB",
  card: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
  tabBar: "#FFFFFF",
  heroText: "#FFFFFF",
  secondaryBtn: "#E5E7EB",
  chipBg: "#E5E7EB",
  chipActiveText: "#FFFFFF",
  successBg: "#D1FAE5",
  surfaceMuted: "#F9FAFB",
};

export const darkColors = {
  ...palette,
  bg: "#0F172A",
  card: "#1E293B",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  border: "#334155",
  inputBg: "#1E293B",
  tabBar: "#1E293B",
  heroText: "#FFFFFF",
  secondaryBtn: "#334155",
  chipBg: "#334155",
  chipActiveText: "#FFFFFF",
  successBg: "#064E3B",
  surfaceMuted: "#1E293B",
};

export type AppColors = typeof lightColors;

/** @deprecated Préférez useTheme().colors */
export const colors = lightColors;
