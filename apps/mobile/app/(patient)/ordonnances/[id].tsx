import { useEffect, useState } from "react";
import { Text, ScrollView, Image, View, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useThemedStyles } from "@/hooks/useThemedStyles";

type MedicamentRow = {
  nom?: string;
  dosage?: string;
  frequence?: string;
  duree?: string;
  instructions?: string;
};

type OrdonnanceDetail = {
  id: string;
  qr_code?: string;
  pdf_url?: string;
  medicaments: MedicamentRow[];
};

function arrayBufferToDataUri(buffer: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return `data:${mime};base64,${globalThis.btoa(binary)}`;
}

export default function OrdonnanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qrUri, setQrUri] = useState<string | null>(null);

  const styles = useThemedStyles((colors) => ({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 },
    med: { fontSize: 16, fontWeight: "600", color: colors.text },
    meta: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
    instructions: { fontSize: 14, color: colors.text, lineHeight: 22, marginTop: 8 },
    code: {
      fontSize: 15,
      color: colors.green,
      fontFamily: "monospace",
      textAlign: "center",
      marginTop: 12,
    },
    qr: { width: 200, height: 200, alignSelf: "center", marginVertical: 16 },
    hint: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 8 },
  }));

  const { data: ordonnance, isLoading } = useQuery({
    queryKey: ["ordonnance", id],
    queryFn: async () => {
      const { data } = await api.get<OrdonnanceDetail>(`/api/v1/ordonnances/${id}`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .get(`/api/v1/ordonnances/${id}/qr`, { responseType: "arraybuffer" })
      .then((res) => {
        if (active) {
          setQrUri(arrayBufferToDataUri(res.data as ArrayBuffer, "image/png"));
        }
      })
      .catch(() => setQrUri(null));
    return () => {
      active = false;
    };
  }, [id]);

  const downloadPdf = async () => {
    if (!id || !ordonnance?.qr_code) return;
    const token = useAuthStore.getState().accessToken;
    try {
      const FileSystem = await import("expo-file-system/legacy");
      const Sharing = await import("expo-sharing");
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!dir) throw new Error("Stockage indisponible");
      const fileUri = `${dir}ordonnance-${ordonnance.qr_code}.pdf`;
      const result = await FileSystem.downloadAsync(
        `${API_URL}/api/v1/ordonnances/${id}/pdf`,
        fileUri,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("PDF enregistré", result.uri);
      }
    } catch {
      Alert.alert(
        "PDF",
        `Téléchargement indisponible. Code pharmacie : ${ordonnance.qr_code}`
      );
    }
  };

  if (isLoading || !ordonnance) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.meta}>Chargement...</Text>
      </ScrollView>
    );
  }

  const meds = ordonnance.medicaments.filter((m) => m.nom);
  const instructions = ordonnance.medicaments.find((m) => m.instructions)?.instructions;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Médicaments prescrits</Text>
        {meds.map((m, i) => (
          <View key={i}>
            <Text style={styles.med}>{m.nom}</Text>
            <Text style={styles.meta}>
              Dosage : {m.dosage} · {m.frequence} · {m.duree}
            </Text>
          </View>
        ))}
        {instructions ? (
          <Text style={styles.instructions}>
            <Text style={{ fontWeight: "700" }}>Instructions : </Text>
            {instructions}
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.title}>Code pharmacie</Text>
        {qrUri ? <Image source={{ uri: qrUri }} style={styles.qr} /> : null}
        {ordonnance.qr_code ? <Text style={styles.code}>{ordonnance.qr_code}</Text> : null}
        <Text style={styles.hint}>
          Présentez ce QR code en officine pour vérification.
        </Text>
        <Button label="Télécharger le PDF" onPress={() => void downloadPdf()} />
      </Card>
    </ScrollView>
  );
}
