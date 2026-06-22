import { useState } from "react";
import { TextInput, Text, StyleSheet, Alert, View } from "react-native";
import { router } from "expo-router";
import { isValidOrangePhone } from "@artek/shared-utils";
import { Screen, Button } from "@/components/ui";
import { colors } from "@/constants/theme";

export default function KiosquePatient() {
  const [telephone, setTelephone] = useState("");

  const handleNext = () => {
    if (!isValidOrangePhone(telephone)) {
      Alert.alert("Numéro invalide", "Entrez le numéro Orange du patient (7XXXXXXX)");
      return;
    }
    router.push({
      pathname: "/(kiosque)/triage",
      params: { telephone },
    });
  };

  return (
    <Screen title="Identification patient" subtitle="Saisie par l'agent ASC">
      <Text style={styles.label}>Téléphone Orange</Text>
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
      <Button label="Continuer vers le triage" onPress={handleNext} />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
