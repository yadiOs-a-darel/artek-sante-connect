import { Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { formatPhoneRCA } from "@artek/shared-utils";
import { Screen, Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { colors } from "@/constants/theme";

export default function ProfilScreen() {
  const logout = useAuthStore((s) => s.logout);
  const telephone = useAuthStore((s) => s.telephone);

  const { data: profile } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me");
      return data;
    },
  });

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/bienvenue");
        },
      },
    ]);
  };

  return (
    <Screen title="Mon profil" subtitle="Paramètres du compte">
      <Card>
        <Text style={styles.name}>
          {profile ? `${profile.prenom} ${profile.nom}` : "Patient"}
        </Text>
        <Text style={styles.phone}>
          {profile ? formatPhoneRCA(profile.telephone) : telephone ? `+236 ${telephone}` : ""}
        </Text>
        {profile && (
          <Text style={styles.meta}>
            {profile.prefecture}
            {profile.village ? ` · ${profile.village}` : ""}
          </Text>
        )}
      </Card>
      <Button label="Déconnexion" variant="outline" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  phone: { fontSize: 15, color: colors.green, marginTop: 6 },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
