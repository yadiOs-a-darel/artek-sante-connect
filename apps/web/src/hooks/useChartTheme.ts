import { useThemeStore } from "@/store/theme.store";

export function useChartTheme() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return {
    grid: isDark ? "#374151" : "#e5e7eb",
    axis: isDark ? "#9CA3AF" : "#6b7280",
    tooltip: {
      background: isDark ? "#111827" : "#ffffff",
      border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
      color: isDark ? "#f3f4f6" : "#111827",
    },
  };
}
