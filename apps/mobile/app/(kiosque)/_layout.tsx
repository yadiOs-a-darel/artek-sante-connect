import { Stack } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

export default function KiosqueLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.green,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="accueil" options={{ title: "Kiosque ARTEK", headerShown: false }} />
      <Stack.Screen name="patient" options={{ title: "Identification" }} />
      <Stack.Screen name="triage" options={{ title: "Triage" }} />
      <Stack.Screen name="mesures" options={{ title: "Constantes vitales" }} />
      <Stack.Screen name="consultation" options={{ title: "Consultation" }} />
    </Stack>
  );
}
