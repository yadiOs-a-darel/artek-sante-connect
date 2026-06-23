import { useMemo } from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatPhoneRCA } from "@artek/shared-utils";
import { MobilePage, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { useTheme } from "@/providers/ThemeProvider";
import type { AppColors } from "@/constants/theme";

export default function DossierScreen() {
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me");
      return data;
    },
  });

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <MobilePage title="Dossier médical" subtitle="Vos informations de santé">
        {isLoading ? (
          <Text style={styles.muted}>Chargement...</Text>
        ) : profile ? (
          <Card style={styles.infoCard}>
            <Row label="Nom" value={`${profile.prenom} ${profile.nom}`} colors={colors} />
            <Row label="Téléphone" value={formatPhoneRCA(profile.telephone)} colors={colors} />
            <Row label="Préfecture" value={profile.prefecture} colors={colors} />
            {profile.village ? (
              <Row label="Village" value={profile.village} colors={colors} />
            ) : null}
            <Row
              label="Langue"
              value={profile.langue_preferee === "sg" ? "Sango" : "Français"}
              colors={colors}
            />
          </Card>
        ) : null}
        <Card>
          <Text style={styles.cardTitle}>Historique complet</Text>
          <Text style={styles.muted}>
            Allergies, antécédents et mesures IoT depuis les kiosques seront ajoutés prochainement.
          </Text>
        </Card>
      </MobilePage>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: AppColors;
}) {
  return (
    <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[rowStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  label: { fontSize: 14, flex: 1 },
  value: { fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
});

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { flexGrow: 1, paddingBottom: 32 },
    infoCard: { width: "100%" },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
    muted: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  });
}
