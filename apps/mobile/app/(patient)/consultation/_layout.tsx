import { Stack } from "expo-router";

export default function ConsultationLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: "#00A651" }}>
      <Stack.Screen name="index" options={{ title: "Consultations" }} />
      <Stack.Screen name="[id]" options={{ title: "Consultation" }} />
    </Stack>
  );
}
