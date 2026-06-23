import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemePreference } from "@/store/theme.store";

const OPTIONS: { value: ThemePreference; label: string; short: string; icon: string }[] = [
  { value: "system", label: "Automatique", short: "Auto", icon: "📱" },
  { value: "light", label: "Clair", short: "Clair", icon: "☀️" },
  { value: "dark", label: "Sombre", short: "Sombre", icon: "🌙" },
];

export function ThemeSelector() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>Apparence</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Suivre le téléphone ou forcer un mode
      </Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        {OPTIONS.map((opt) => {
          const active = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.label}
              style={[
                styles.segment,
                active && { backgroundColor: colors.green },
              ]}
              onPress={() => void setPreference(opt.value)}
            >
              <Text style={styles.icon}>{opt.icon}</Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.segmentText,
                  { color: active ? "#FFFFFF" : colors.text },
                ]}
              >
                {opt.short}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "stretch",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  track: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  icon: { fontSize: 18, marginBottom: 4 },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
