import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export function Screen({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();

  const variantStyle =
    variant === "primary"
      ? { backgroundColor: colors.green }
      : variant === "secondary"
        ? { backgroundColor: colors.secondaryBtn }
        : variant === "danger"
          ? { backgroundColor: colors.danger }
          : { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.green };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, variantStyle, disabled && styles.btnDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "danger" ? colors.green : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "outline" && { color: colors.green },
            variant === "secondary" && { color: colors.text },
            variant === "danger" && { color: "#fff" },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export { MobilePage, HeroBanner, QuickAction, StatusPill } from "./layout";
export { ThemeSelector } from "./ThemeSelector";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignSelf: "stretch",
    width: "100%",
  },
});
