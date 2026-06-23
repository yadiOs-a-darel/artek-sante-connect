import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Button } from "@/components/ui";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/providers/ThemeProvider";

const SYMPTOMES = ["Fièvre", "Maux de tête", "Toux", "Douleurs", "Grossesse", "Autre"];

export default function KiosqueTriage() {
  const { colors } = useTheme();
  const { telephone, kiosqueId } = useLocalSearchParams<{
    telephone: string;
    kiosqueId?: string;
  }>();
  const [motif, setMotif] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const styles = useThemedStyles((c) => ({
    label: { fontSize: 14, color: c.textMuted, marginBottom: 8, marginTop: 8 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.chipBg,
      color: c.text,
      overflow: "hidden",
    },
    chipActive: {
      backgroundColor: c.successBg,
      color: c.green,
      fontWeight: "600",
    },
    input: {
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 14,
      minHeight: 80,
      textAlignVertical: "top",
      color: c.text,
    },
  }));

  const toggle = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleNext = () => {
    const fullMotif = [motif, ...selected].filter(Boolean).join(", ") || "Consultation kiosque";
    router.push({
      pathname: "/(kiosque)/mesures",
      params: { telephone, motif: fullMotif, kiosqueId: kiosqueId || "kiosk-bangui-01" },
    });
  };

  return (
    <Screen title="Triage" subtitle={`Patient +236 ${telephone}`}>
      <Text style={styles.label}>Symptômes principaux</Text>
      <View style={styles.chips}>
        {SYMPTOMES.map((s) => (
          <Text
            key={s}
            onPress={() => toggle(s)}
            style={[styles.chip, selected.includes(s) && styles.chipActive]}
          >
            {s}
          </Text>
        ))}
      </View>
      <Text style={styles.label}>Motif complémentaire</Text>
      <TextInput
        style={styles.input}
        placeholder="Décrivez les symptômes..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={motif}
        onChangeText={setMotif}
      />
      <Button label="Prendre les constantes" onPress={handleNext} />
    </Screen>
  );
}
