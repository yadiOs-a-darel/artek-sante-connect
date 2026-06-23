import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";

export default function PatientLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "Consultations",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dossier"
        options={{
          title: "Dossier",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ordonnances"
        options={{ href: null }}
      />
      <Tabs.Screen name="demande" options={{ href: null }} />
      <Tabs.Screen name="kiosques" options={{ href: null }} />
    </Tabs>
  );
}
