import { Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { formatPhoneRCA } from "@artek/shared-utils";
import type { Consultation } from "@artek/types";
import { Screen, Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function AccueilPatient() {
  const { data: profile, refetch: refetchProfile, isFetching: loadingProfile } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me");
      return data;
    },
  });

  const { data: consultations, refetch: refetchConsultations, isFetching: loadingConsultations } =
    useQuery({
      queryKey: ["patient-consultations"],
      queryFn: async () => {
        const { data } = await api.get("/api/v1/patients/me/consultations");
        return data;
      },
    });

  const prochaine = consultations?.items?.find(
    (c: Consultation) => c.statut === "en_attente" || c.statut === "en_cours"
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loadingProfile || loadingConsultations}
          onRefresh={() => {
            refetchProfile();
            refetchConsultations();
          }}
          colors={[colors.green]}
        />
      }
    >
      <Screen
        title={`Bonjour${profile?.prenom ? `, ${profile.prenom}` : ""}`}
        subtitle={profile ? formatPhoneRCA(profile.telephone) : "Chargement..."}
      >
        {prochaine ? (
          <Card>
            <Text style={styles.cardTitle}>Prochaine consultation</Text>
            <Text style={styles.cardText}>{prochaine.motif || "Consultation vidéo"}</Text>
            <Text style={styles.badge}>{prochaine.statut.replace("_", " ")}</Text>
            <Button
              label="Rejoindre"
              onPress={() =>
                router.push({
                  pathname: "/(patient)/consultation/[id]",
                  params: { id: prochaine.id },
                })
              }
            />
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardText}>Aucune consultation en cours.</Text>
            <Button
              label="Voir les consultations"
              variant="outline"
              onPress={() => router.push("/(patient)/consultation")}
            />
          </Card>
        )}

        <Card>
          <Text style={styles.cardTitle}>Mes ordonnances</Text>
          <Text style={styles.cardText}>Consultez vos ordonnances numériques et QR codes.</Text>
          <Button
            label="Ouvrir"
            variant="secondary"
            onPress={() => router.push("/(patient)/ordonnances")}
          />
        </Card>
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#D1FAE5",
    color: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
});
