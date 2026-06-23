import { useMemo } from "react";
import { Text, StyleSheet, ScrollView, RefreshControl, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { formatPhoneRCA } from "@artek/shared-utils";
import type { Consultation } from "@artek/types";
import {
  Card,
  Button,
  HeroBanner,
  QuickAction,
  StatusPill,
} from "@/components/ui";
import { useKiosques } from "@/hooks/useKiosques";
import { api } from "@/lib/api";
import { useTheme } from "@/providers/ThemeProvider";

const STATUT_TONE: Record<string, "green" | "orange" | "gray"> = {
  en_attente_validation: "orange",
  programmee: "green",
  en_cours: "green",
  en_attente: "orange",
};

export default function AccueilPatient() {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: colors.green },
        scrollContent: { flexGrow: 1, paddingBottom: 32 },
        sheet: {
          flex: 1,
          backgroundColor: colors.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -16,
          paddingHorizontal: 20,
          paddingTop: 24,
        },
        quickRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
        featureCard: {
          borderColor: `${colors.green}40`,
          backgroundColor: colors.card,
        },
        sectionLabel: {
          fontSize: 11,
          fontWeight: "700",
          color: colors.green,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 6,
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 8,
          lineHeight: 24,
        },
        cardText: {
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 21,
          marginBottom: 4,
        },
        kioskHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        },
        kioskIcon: { fontSize: 28 },
        kioskRow: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 10,
        },
        kioskDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.green,
        },
        kioskInfo: { flex: 1 },
        kioskName: { fontSize: 15, fontWeight: "600", color: colors.text },
        kioskMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
        kioskStatus: { fontSize: 11, fontWeight: "600" },
        online: { color: colors.green },
        offline: { color: colors.danger },
      }),
    [colors]
  );

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

  const { data: kiosques } = useKiosques();

  const active = consultations?.items?.find((c: Consultation & { statut: string }) =>
    ["en_attente_validation", "programmee", "en_attente", "en_cours"].includes(c.statut)
  );

  const kiosquesActifs = kiosques?.filter((k) => k.statut === "actif").length ?? 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loadingProfile || loadingConsultations}
          onRefresh={() => {
            refetchProfile();
            refetchConsultations();
          }}
          colors={[colors.green]}
          tintColor={colors.green}
        />
      }
    >
      <HeroBanner
        emoji="👋"
        greeting={`Bonjour${profile?.prenom ? `, ${profile.prenom}` : ""}`}
        line2={profile ? formatPhoneRCA(profile.telephone) : "Chargement..."}
      />

      <View style={styles.sheet}>
        <View style={styles.quickRow}>
          <QuickAction
            icon="🩺"
            label="Consultation"
            onPress={() => router.push("/(patient)/demande/nouvelle")}
          />
          <QuickAction
            icon="📋"
            label="Ordonnances"
            color={colors.blue}
            onPress={() => router.push("/(patient)/ordonnances")}
          />
          <QuickAction
            icon="☀️"
            label="Kiosques"
            color={colors.orange}
            onPress={() => router.push("/(patient)/kiosques")}
          />
        </View>

        {active ? (
          <Card style={styles.featureCard}>
            <Text style={styles.sectionLabel}>Consultation en cours</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {active.motif || active.symptomes || "Téléconsultation"}
            </Text>
            <StatusPill
              label={active.statut.replace(/_/g, " ")}
              tone={STATUT_TONE[active.statut] ?? "gray"}
            />
            <Button
              label="Voir le détail"
              onPress={() =>
                router.push({
                  pathname: "/(patient)/consultation/[id]",
                  params: { id: active.id },
                })
              }
            />
          </Card>
        ) : (
          <Card style={styles.featureCard}>
            <Text style={styles.sectionLabel}>Première étape</Text>
            <Text style={styles.cardTitle}>Besoin d&apos;un médecin ?</Text>
            <Text style={styles.cardText}>
              Décrivez vos symptômes, saisissez vos constantes et choisissez un spécialiste.
            </Text>
            <Button
              label="Nouvelle demande"
              onPress={() => router.push("/(patient)/demande/nouvelle")}
            />
          </Card>
        )}

        <Card>
          <View style={styles.kioskHeader}>
            <View>
              <Text style={styles.sectionLabel}>Kiosques solaires ASC</Text>
              <Text style={styles.cardText}>
                {kiosquesActifs} point{kiosquesActifs !== 1 ? "s" : ""} actif
                {kiosquesActifs !== 1 ? "s" : ""} près de vous
              </Text>
            </View>
            <Text style={styles.kioskIcon}>☀️</Text>
          </View>
          {kiosques?.slice(0, 2).map((k) => (
            <View key={k.id} style={styles.kioskRow}>
              <View style={styles.kioskDot} />
              <View style={styles.kioskInfo}>
                <Text style={styles.kioskName}>{k.prefecture}</Text>
                <Text style={styles.kioskMeta}>
                  {k.village ?? "—"} · Batterie {k.batterie_pct}%
                </Text>
              </View>
              <Text style={[styles.kioskStatus, k.connexion_ok ? styles.online : styles.offline]}>
                {k.connexion_ok ? "En ligne" : "Hors ligne"}
              </Text>
            </View>
          ))}
          <Button
            label="Voir tous les kiosques"
            variant="outline"
            onPress={() => router.push("/(patient)/kiosques")}
          />
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>Mode kiosque</Text>
          <Text style={styles.cardText}>
            Sur place dans un centre ASC ? Lancez le parcours guidé (identification, triage, mesures).
          </Text>
          <Button
            label="Ouvrir le mode kiosque"
            variant="secondary"
            onPress={() => router.push("/(kiosque)/accueil")}
          />
        </Card>
      </View>
    </ScrollView>
  );
}
