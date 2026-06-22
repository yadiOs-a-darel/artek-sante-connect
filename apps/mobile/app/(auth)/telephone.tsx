import { useState } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { isValidOrangePhone } from "@artek/shared-utils";
import { Button, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/constants/theme";

export default function TelephoneScreen() {
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!isValidOrangePhone(telephone)) {
      Alert.alert("Numéro invalide", "Entrez un numéro Orange RCA (7XXXXXXX)");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/otp/request", { telephone });
      router.push({
        pathname: "/(auth)/otp",
        params: { telephone, devOtp: data.dev_otp ?? "" },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Impossible d'envoyer le code";
      Alert.alert("Erreur", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Connexion" subtitle="Votre numéro Orange (+236) est votre identifiant">
      <Text style={styles.label}>Téléphone</Text>
      <View style={styles.row}>
        <Text style={styles.prefix}>+236</Text>
        <TextInput
          style={styles.input}
          placeholder="77000001"
          keyboardType="phone-pad"
          maxLength={8}
          value={telephone}
          onChangeText={setTelephone}
        />
      </View>
      <Text style={styles.hint}>Patient test : 77000001 (après seed)</Text>
      <Button label="Recevoir le code SMS" onPress={handleContinue} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
});
