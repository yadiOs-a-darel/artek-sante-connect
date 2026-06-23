import { useState } from "react";
import { TextInput, Text, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Button, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { colors } from "@/constants/theme";

type Mode = "login" | "register";

export default function OtpScreen() {
  const { telephone, devOtp, mode, compteExiste } = useLocalSearchParams<{
    telephone: string;
    devOtp?: string;
    mode?: Mode;
    compteExiste?: string;
  }>();
  const flow: Mode = mode === "register" ? "register" : "login";
  const [otp, setOtp] = useState(devOtp || "");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleContinue = async () => {
    if (!telephone || otp.length < 4) {
      Alert.alert("Code requis", "Entrez le code à 6 chiffres reçu par SMS");
      return;
    }

    if (flow === "register") {
      if (compteExiste === "1") {
        Alert.alert("Compte existant", "Ce numéro est déjà enregistré. Connectez-vous.");
        router.replace({ pathname: "/(auth)/telephone", params: { mode: "login" } });
        return;
      }
      router.push({
        pathname: "/(auth)/inscription",
        params: { telephone, otp },
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/login/patient", { telephone, otp });
      await setAuth(data.access_token, data.refresh_token, "patient", telephone);
      router.replace("/(patient)/accueil");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? String(err.response?.data?.detail ?? "Code incorrect")
        : "Code incorrect";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Vérification" subtitle={`Code envoyé au +236 ${telephone}`}>
      {devOtp ? <Text style={styles.devHint}>Mode dev — code : {devOtp}</Text> : null}
      <Text style={styles.label}>Code OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <Button
        label={flow === "register" ? "Continuer" : "Se connecter"}
        onPress={handleContinue}
        loading={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  devHint: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    color: colors.text,
  },
});
