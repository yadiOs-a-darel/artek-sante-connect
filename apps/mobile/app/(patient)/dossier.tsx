import { Text, StyleSheet, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatPhoneRCA } from "@artek/shared-utils";
import { Screen, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function DossierScreen() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me");
      return data;
    },
  });

  return (
    <ScrollView style={styles.scroll}>
      <Screen title="Dossier médical" subtitle="Vos informations de santé">
        {isLoading ? (
          <Text style={styles.muted}>Chargement...</Text>
        ) : profile ? (
          <Card>
            <Row label="Nom" value={`${profile.prenom} ${profile.nom}`} />
            <Row label="Téléphone" value={formatPhoneRCA(profile.telephone)} />
            <Row label="Préfecture" value={profile.prefecture} />
            {profile.village && <Row label="Village" value={profile.village} />}
            <Row label="Langue" value={profile.langue_preferee === "sg" ? "Sango" : "Français"} />
          </Card>
        ) : null}
        <Card>
          <Text style={styles.cardTitle}>Historique complet</Text>
          <Text style={styles.muted}>
            Le dossier médical numérique détaillé (allergies, antécédents, mesures IoT) sera
            enrichi dans une prochaine version.
          </Text>
        </Card>
      </Screen>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 },
  muted: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { color: colors.textMuted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: "500" },
});
