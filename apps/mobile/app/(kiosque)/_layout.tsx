import { Stack } from "expo-router";

export default function KiosqueLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: "#00A651" }}>
      <Stack.Screen name="accueil" options={{ title: "Kiosque ARTEK" }} />
      <Stack.Screen name="patient" options={{ title: "Identification" }} />
      <Stack.Screen name="triage" options={{ title: "Triage" }} />
      <Stack.Screen name="mesures" options={{ title: "Constantes vitales" }} />
      <Stack.Screen name="consultation" options={{ title: "Consultation" }} />
    </Stack>
  );
}
