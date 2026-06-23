import { Stack } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

export default function ConsultationLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.green,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Consultation",
          headerBackTitle: "Retour",
        }}
      />
    </Stack>
  );
}
