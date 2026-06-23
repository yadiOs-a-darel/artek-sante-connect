import { Text, StyleSheet, FlatList, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Consultation } from "@artek/types";
import { StatusPill } from "@/components/ui";
import { api } from "@/lib/api";
import { useThemedStyles } from "@/hooks/useThemedStyles";

const STATUT_TONE: Record<string, "green" | "orange" | "gray"> = {
  en_attente_validation: "orange",
  programmee: "green",
  en_cours: "green",
  refusee: "gray",
  terminee: "gray",
};

export default function ConsultationsList() {
  const styles = useThemedStyles((colors) => ({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    list: { flex: 1 },
    content: { padding: 20, paddingTop: 8 },
    emptyList: { flexGrow: 1, justifyContent: "center", padding: 32 },
    row: {
      backgroundColor: colors.card,
      padding: 18,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    motif: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 10, lineHeight: 22 },
    emptyWrap: { alignItems: "center" },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    empty: { textAlign: "center", color: colors.textMuted, fontSize: 15 },
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["patient-consultations"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me/consultations");
      return data;
    },
  });

  const items: Consultation[] = data?.items ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Consultations</Text>
        <Text style={styles.subtitle}>Historique et suivi de vos rendez-vous</Text>
      </View>

      {isLoading ? (
        <Text style={styles.empty}>Chargement...</Text>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={items.length === 0 ? styles.emptyList : styles.content}
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.empty}>Aucune consultation pour le moment.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/(patient)/consultation/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.motif} numberOfLines={2}>
                {(item as Consultation & { symptomes?: string }).symptomes ||
                  item.motif ||
                  item.type_consultation}
              </Text>
              <StatusPill
                label={item.statut.replace(/_/g, " ")}
                tone={STATUT_TONE[item.statut] ?? "gray"}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
