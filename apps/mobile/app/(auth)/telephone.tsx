import { useState } from "react";
import { View, TextInput, Text, StyleSheet, Alert, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { isValidOrangePhone } from "@artek/shared-utils";
import { Button, Screen } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { colors } from "@/constants/theme";

type Mode = "login" | "register";

export default function TelephoneScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(modeParam === "register" ? "register" : "login");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!isValidOrangePhone(telephone)) {
      Alert.alert("Numéro invalide", "Entrez un numéro Orange RCA (72, 73 ou 74…)");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/otp/request", {
        telephone,
        inscription: mode === "register",
      });
      router.push({
        pathname: "/(auth)/otp",
        params: {
          telephone,
          mode,
          devOtp: data.dev_otp ?? "",
          compteExiste: data.compte_existe ? "1" : "0",
        },
      });
    } catch (err: unknown) {
      let msg = "Impossible d'envoyer le code";
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          msg = `API inaccessible (${API_URL}). Vérifiez le Wi‑Fi et le backend (--host 0.0.0.0).`;
        } else {
          msg = String(err.response.data?.detail ?? msg);
        }
      }
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title={mode === "login" ? "Connexion" : "Inscription"}
      subtitle="Numéro Orange (+236) — préfixes 72, 73, 74"
    >
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, mode === "login" && styles.tabActive]}
          onPress={() => setMode("login")}
        >
          <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Connexion</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === "register" && styles.tabActive]}
          onPress={() => setMode("register")}
        >
          <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
            Créer un compte
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Téléphone</Text>
      <View style={styles.row}>
        <Text style={styles.prefix}>+236</Text>
        <TextInput
          style={styles.input}
          placeholder="72000001"
          keyboardType="phone-pad"
          maxLength={8}
          value={telephone}
          onChangeText={setTelephone}
        />
      </View>
      {__DEV__ ? <Text style={styles.apiHint}>API : {API_URL}</Text> : null}
      <Button
        label={mode === "login" ? "Recevoir le code SMS" : "Continuer l'inscription"}
        onPress={requestOtp}
        loading={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", marginBottom: 20, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.green },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: "#fff" },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  prefix: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  apiHint: {
    marginTop: 12,
    fontSize: 11,
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 8,
  },
});
