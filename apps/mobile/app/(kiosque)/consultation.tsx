import { Text, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Screen, Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useThemedStyles } from "@/hooks/useThemedStyles";

function parseTension(tension?: string) {
  if (!tension) return {};
  const [sys, dia] = tension.split("/").map((v) => parseFloat(v.trim()));
  return {
    tension_sys: Number.isFinite(sys) ? sys : undefined,
    tension_dia: Number.isFinite(dia) ? dia : undefined,
  };
}

export default function KiosqueConsultation() {
  const styles = useThemedStyles((colors) => ({
    label: { fontSize: 13, color: colors.textMuted },
    value: { fontSize: 16, color: colors.text, marginTop: 4, marginBottom: 8 },
    meta: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
    success: { fontSize: 16, fontWeight: "600", color: colors.green },
  }));

  const { telephone, motif, kiosqueId, tension, spo2, temperature } =
    useLocalSearchParams<{
      telephone: string;
      motif: string;
      kiosqueId?: string;
      tension?: string;
      spo2?: string;
      temperature?: string;
    }>();
  const [loading, setLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const createConsultation = async () => {
    setLoading(true);
    try {
      const mesures = {
        ...parseTension(tension),
        spo2: spo2 ? parseFloat(spo2) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
      };
      const hasMesures = Object.values(mesures).some((v) => v != null);

      const { data } = await api.post("/api/v1/kiosques/start-consultation", {
        telephone,
        motif: motif || "Consultation kiosque",
        kiosque_id: kiosqueId || "kiosk-bangui-01",
        mesures: hasMesures ? mesures : undefined,
      });

      setConsultationId(data.id);
      Alert.alert(
        "Demande envoyée",
        "Le médecin a reçu la demande dans son agenda (section « Demandes à valider »).",
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
        <Text style={styles.label}>Kiosque</Text>
        <Text style={styles.value}>{kiosqueId || "kiosk-bangui-01"}</Text>
        <Text style={styles.label}>Motif</Text>
        <Text style={styles.value}>{motif}</Text>
        {tension ? <Text style={styles.meta}>Tension : {tension}</Text> : null}
        {spo2 ? <Text style={styles.meta}>SpO₂ : {spo2} %</Text> : null}
        {temperature ? <Text style={styles.meta}>Température : {temperature} °C</Text> : null}
      </Card>

      {consultationId ? (
        <Card>
          <Text style={styles.success}>Demande #{consultationId.slice(0, 8)}…</Text>
          <Text style={styles.meta}>En attente de validation par le médecin</Text>
        </Card>
      ) : (
        <Button label="Envoyer au médecin" onPress={createConsultation} loading={loading} />
      )}

      <Button
        label="Nouveau patient"
        variant="outline"
        onPress={() =>
          router.replace({
            pathname: "/(kiosque)/accueil",
            params: { kiosqueId: kiosqueId || "kiosk-bangui-01" },
          })
        }
      />
    </Screen>
  );
}
