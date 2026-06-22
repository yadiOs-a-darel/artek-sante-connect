import { Text, StyleSheet, View, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function ConsultationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: consultation } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/consultations/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: video } = useQuery({
    queryKey: ["video-session", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/consultations/${id}/video`);
      return data;
    },
    enabled: !!id,
  });

  const openVideo = () => {
    if (video?.room_url) {
      Linking.openURL(video.room_url);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{consultation?.motif || "Consultation"}</Text>
      <Text style={styles.statut}>Statut : {consultation?.statut}</Text>
      <Text style={styles.type}>Type : {consultation?.type_consultation}</Text>

      {video?.room_url ? (
        <Button label="Rejoindre Google Meet" onPress={openVideo} />
      ) : (
        <Text style={styles.hint}>
          {video?.message ||
            "Le lien Google Meet sera disponible quand le médecin démarrera la consultation."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
  statut: { fontSize: 15, color: colors.green, marginBottom: 4, textTransform: "capitalize" },
  type: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  hint: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
});
