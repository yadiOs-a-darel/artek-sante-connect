import { Text, StyleSheet, View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { ConsultationChat } from "@/components/consultation/ConsultationChat";
import { api } from "@/lib/api";
import { openExternalUrl } from "@/lib/openExternalUrl";
import { useThemedStyles } from "@/hooks/useThemedStyles";

const STATUT_LABELS: Record<string, string> = {
  en_attente_validation: "En attente de validation",
  refusee: "Refusée",
  programmee: "Programmée",
  en_attente: "En attente",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

export default function ConsultationDetail() {
  const styles = useThemedStyles((colors) => ({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
    statut: { fontSize: 15, color: colors.green, marginBottom: 8, textTransform: "capitalize" },
    refusee: { color: colors.danger },
    meta: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
    reponseBox: {
      backgroundColor: colors.successBg,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reponseTitle: { fontWeight: "600", color: colors.green, marginBottom: 6 },
    reponseText: { fontSize: 14, color: colors.text, lineHeight: 20 },
    hint: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 16 },
  }));

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: consultation, refetch } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/consultations/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const statut = consultation?.statut ?? "";
  const canJoin =
    statut === "programmee" || statut === "en_cours" || statut === "en_attente";
  const canChat =
    statut !== "en_attente_validation" && statut !== "refusee" && statut !== "annulee";

  const { data: video } = useQuery({
    queryKey: ["video-session", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/consultations/${id}/video`);
      return data;
    },
    enabled: !!id && canJoin,
  });

  const openVideo = async () => {
    const url = consultation?.salle_video_url || video?.room_url;
    if (url) await openExternalUrl(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{consultation?.symptomes || consultation?.motif || "Consultation"}</Text>
      <Text style={[styles.statut, statut === "refusee" && styles.refusee]}>
        {STATUT_LABELS[statut] || statut}
      </Text>

      {consultation?.programmee_le ? (
        <Text style={styles.meta}>
          Rendez-vous : {new Date(consultation.programmee_le).toLocaleString("fr-FR")}
        </Text>
      ) : null}

      {consultation?.reponse_medecin ? (
        <View style={styles.reponseBox}>
          <Text style={styles.reponseTitle}>Réponse du médecin</Text>
          <Text style={styles.reponseText}>{consultation.reponse_medecin}</Text>
        </View>
      ) : null}

      {statut === "en_attente_validation" ? (
        <Text style={styles.hint}>
          Votre demande a été envoyée. Le médecin va l&apos;examiner et vous répondre ici.
        </Text>
      ) : null}

      {canJoin && (consultation?.salle_video_url || video?.room_url) ? (
        <Button label="Rejoindre Google Meet" onPress={openVideo} />
      ) : canJoin ? (
        <Text style={styles.hint}>
          {video?.message || "Le lien vidéo sera disponible prochainement."}
        </Text>
      ) : null}

      {id && canChat ? <ConsultationChat consultationId={id} /> : null}

      <Button label="Actualiser" variant="outline" onPress={() => refetch()} />
    </ScrollView>
  );
}
