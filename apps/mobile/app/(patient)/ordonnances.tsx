import { Text, StyleSheet, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

import type { ApiListResponse } from "@artek/types";

interface OrdonnanceItem {
  id: string;
  qr_code?: string;
  medicaments: { nom: string }[];
}

export default function OrdonnancesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-ordonnances"],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<OrdonnanceItem>>("/api/v1/ordonnances");
      return data;
    },
  });

  return (
    <Screen title="Ordonnances" subtitle="Vos ordonnances numériques">
      {isLoading ? (
        <Text style={styles.muted}>Chargement...</Text>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.muted}>Aucune ordonnance.</Text>}
          renderItem={({ item }) => (
            <Card>
              {item.medicaments?.map((m, i) => (
                <Text key={i} style={styles.med}>
                  {m.nom}
                </Text>
              ))}
              {item.qr_code && (
                <Text style={styles.qr}>QR : {item.qr_code}</Text>
              )}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted, fontSize: 14 },
  med: { fontSize: 15, color: colors.text, marginBottom: 4 },
  qr: { fontSize: 13, color: colors.green, marginTop: 8, fontFamily: "monospace" },
});
