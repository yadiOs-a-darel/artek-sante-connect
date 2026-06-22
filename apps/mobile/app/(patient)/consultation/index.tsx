import { Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Consultation } from "@artek/types";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function ConsultationsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-consultations"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/patients/me/consultations");
      return data;
    },
  });

  if (isLoading) {
    return <Text style={styles.empty}>Chargement...</Text>;
  }

  const items: Consultation[] = data?.items ?? [];

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.empty}>Aucune consultation pour le moment.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: "/(patient)/consultation/[id]",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.motif}>{item.motif || item.type_consultation}</Text>
          <Text style={styles.statut}>{item.statut.replace("_", " ")}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  row: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  motif: { fontSize: 16, fontWeight: "600", color: colors.text },
  statut: { fontSize: 13, color: colors.green, marginTop: 4, textTransform: "capitalize" },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
});
