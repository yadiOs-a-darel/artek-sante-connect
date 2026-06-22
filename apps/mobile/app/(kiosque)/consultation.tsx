import { Text, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Screen, Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function KiosqueConsultation() {
  const { telephone, motif, tension, spo2, temperature } = useLocalSearchParams<{
    telephone: string;
    motif: string;
    tension?: string;
    spo2?: string;
    temperature?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const createConsultation = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/kiosques/start-consultation", {
        telephone,
        motif: `[Kiosque] ${motif}${tension ? ` | TA:${tension}` : ""}${spo2 ? ` SpO2:${spo2}%` : ""}${temperature ? ` T:${temperature}°C` : ""}`,
        kiosque_id: "kiosk-bangui-01",
      });

      setConsultationId(data.id);
      Alert.alert(
        "Consultation créée",
        "Le médecin peut maintenant rejoindre la salle depuis son dashboard.",
        [{ text: "OK" }]
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Erreur lors de la création";
      Alert.alert("Erreur", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Consultation" subtitle={`Patient +236 ${telephone}`}>
      <Card>
        <Text style={styles.label}>Motif</Text>
        <Text style={styles.value}>{motif}</Text>
        {tension && <Text style={styles.meta}>Tension : {tension}</Text>}
        {spo2 && <Text style={styles.meta}>SpO₂ : {spo2} %</Text>}
        {temperature && <Text style={styles.meta}>Température : {temperature} °C</Text>}
      </Card>

      {consultationId ? (
        <Card>
          <Text style={styles.success}>Consultation #{consultationId.slice(0, 8)}…</Text>
          <Text style={styles.meta}>En attente du médecin</Text>
        </Card>
      ) : (
        <Button label="Créer la téléconsultation" onPress={createConsultation} loading={loading} />
      )}

      <Button
        label="Nouveau patient"
        variant="outline"
        onPress={() => router.replace("/(kiosque)/accueil")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.textMuted },
  value: { fontSize: 16, color: colors.text, marginTop: 4, marginBottom: 8 },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  success: { fontSize: 16, fontWeight: "600", color: colors.green },
});
