import { useState } from "react";
import { TextInput, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Button, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { colors } from "@/constants/theme";
import { PREFECTURES } from "@/constants/specialites";

export default function InscriptionScreen() {
  const { telephone, otp } = useLocalSearchParams<{ telephone: string; otp: string }>();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [prefecture, setPrefecture] = useState<string>(PREFECTURES[0]);
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!telephone || !otp || nom.length < 2 || prenom.length < 2) {
      Alert.alert("Formulaire incomplet", "Remplissez tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/register/patient", {
        telephone,
        otp,
        nom,
        prenom,
        prefecture,
        village: village || undefined,
        consentement: true,
      });
      await setAuth(data.access_token, data.refresh_token, "patient", telephone);
      router.replace("/(patient)/accueil");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? String(err.response?.data?.detail ?? "Inscription impossible")
        : "Inscription impossible";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Screen title="Créer mon compte" subtitle={`+236 ${telephone}`}>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Jean" />
        <Text style={styles.label}>Nom *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Koyamba" />
        <Text style={styles.label}>Préfecture *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {PREFECTURES.map((p) => (
            <Text
              key={p}
              style={[styles.chip, prefecture === p && styles.chipActive]}
              onPress={() => setPrefecture(p)}
            >
              {p}
            </Text>
          ))}
        </ScrollView>
        <Text style={styles.label}>Village</Text>
        <TextInput style={styles.input} value={village} onChangeText={setVillage} placeholder="PK5" />
        <Text style={styles.consent}>
          En créant un compte, j&apos;accepte le traitement de mes données de santé par ARTEK.
        </Text>
        <Button label="Créer mon compte" onPress={handleRegister} loading={loading} />
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingBottom: 32 },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  chips: { flexDirection: "row", marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  chipActive: { backgroundColor: colors.green, color: "#fff" },
  consent: { fontSize: 12, color: colors.textMuted, marginVertical: 16, lineHeight: 18 },
});
