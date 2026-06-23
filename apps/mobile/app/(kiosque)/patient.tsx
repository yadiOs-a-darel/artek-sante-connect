import { useState } from "react";
import { TextInput, Text, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { isValidOrangePhone } from "@artek/shared-utils";
import { Screen, Button } from "@/components/ui";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/providers/ThemeProvider";

export default function KiosquePatient() {
  const { colors } = useTheme();
  const { kiosqueId } = useLocalSearchParams<{ kiosqueId?: string }>();
  const [telephone, setTelephone] = useState("");
  const kiosk = kiosqueId || "kiosk-bangui-01";

  const styles = useThemedStyles((c) => ({
    label: { fontSize: 14, color: c.textMuted, marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    prefix: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: c.chipBg,
      borderRadius: 12,
      color: c.textMuted,
      fontWeight: "600",
    },
    input: {
      flex: 1,
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 18,
      color: c.text,
    },
  }));

  const handleNext = () => {
    if (!isValidOrangePhone(telephone)) {
      Alert.alert("Numéro invalide", "Entrez le numéro Orange du patient (72, 73 ou 74…)");
      return;
    }
    router.push({
      pathname: "/(kiosque)/triage",
      params: { telephone, kiosqueId: kiosk },
    });
  };

  return (
    <Screen title="Identification patient" subtitle="Saisie par l'agent ASC">
      <Text style={styles.label}>Téléphone Orange</Text>
      <View style={styles.row}>
        <Text style={styles.prefix}>+236</Text>
        <TextInput
          style={styles.input}
          placeholder="72000001"
          placeholderTextColor={colors.textMuted}
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
