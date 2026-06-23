import { Text, FlatList, Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Screen, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { useThemedStyles } from "@/hooks/useThemedStyles";

import type { ApiListResponse } from "@artek/types";

type MedicamentRow = {
  nom?: string;
  dosage?: string;
  frequence?: string;
  duree?: string;
  instructions?: string;
};

interface OrdonnanceItem {
  id: string;
  qr_code?: string;
  medicaments: MedicamentRow[];
}

export default function OrdonnancesScreen() {
  const styles = useThemedStyles((colors) => ({
    muted: { color: colors.textMuted, fontSize: 14 },
    med: { fontSize: 15, color: colors.text, marginBottom: 4, fontWeight: "600" },
    meta: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
    qr: { fontSize: 13, color: colors.green, marginTop: 8, fontFamily: "monospace" },
    link: { fontSize: 13, color: colors.green, marginTop: 10, fontWeight: "600" },
  }));

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
          renderItem={({ item }) => {
            const meds = item.medicaments?.filter((m) => m.nom) ?? [];
            return (
              <Pressable onPress={() => router.push(`/(patient)/ordonnances/${item.id}`)}>
                <Card>
                  {meds.map((m, i) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                      <Text style={styles.med}>{m.nom}</Text>
                      <Text style={styles.meta}>
                        {[m.dosage, m.frequence, m.duree].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                  ))}
                  {item.qr_code ? <Text style={styles.qr}>{item.qr_code}</Text> : null}
                  <Text style={styles.link}>Voir le QR et le PDF →</Text>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
