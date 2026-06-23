import { View, Text, StyleSheet, ViewStyle, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";

type MobilePageProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  hero?: React.ReactNode;
  style?: ViewStyle;
};

export function MobilePage({
  children,
  title,
  subtitle,
  centered = false,
  hero,
  style,
}: MobilePageProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }, style]} edges={["top"]}>
      {hero}
      <View style={[styles.inner, centered && styles.innerCentered]}>
        {(title || subtitle) && (
          <View style={[styles.header, centered && styles.headerCentered]}>
            {title ? (
              <Text
                style={[styles.title, { color: colors.text }, centered && styles.textCenter]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textMuted },
                  centered && styles.textCenter,
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
        <View style={[styles.body, centered && styles.bodyCentered]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

export function HeroBanner({
  greeting,
  line2,
  emoji,
}: {
  greeting: string;
  line2?: string;
  emoji?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.hero, { backgroundColor: colors.green }]}>
      {emoji ? <Text style={styles.heroEmoji}>{emoji}</Text> : null}
      <Text style={styles.heroGreeting}>{greeting}</Text>
      {line2 ? <Text style={styles.heroLine2}>{line2}</Text> : null}
    </View>
  );
}

export function QuickAction({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const { colors } = useTheme();
  const accent = color ?? colors.green;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && styles.quickPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${accent}18` }]}>
        <Text style={styles.quickEmoji}>{icon}</Text>
      </View>
      <Text style={[styles.quickLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({
  label,
  tone = "green",
}: {
  label: string;
  tone?: "green" | "orange" | "gray";
}) {
  const { colors, isDark } = useTheme();
  const bg =
    tone === "orange"
      ? isDark
        ? "#7C2D12"
        : "#FFEDD5"
      : tone === "gray"
        ? isDark
          ? colors.chipBg
          : "#F3F4F6"
        : colors.successBg;
  const fg =
    tone === "orange"
      ? isDark
        ? "#FDBA74"
        : "#C2410C"
      : tone === "gray"
        ? colors.textMuted
        : colors.green;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  innerCentered: { justifyContent: "center" },
  header: { marginBottom: 20, marginTop: 12 },
  headerCentered: { alignItems: "center", marginTop: 0 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  textCenter: { textAlign: "center" },
  body: { flex: 1, width: "100%" },
  bodyCentered: { width: "100%" },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroGreeting: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  heroLine2: {
    fontSize: 15,
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: "30%",
  },
  quickPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  pillText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
});
