import { useState } from "react";
import { Text, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Button } from "@/components/ui";
import { colors } from "@/constants/theme";

const SYMPTOMES = ["Fièvre", "Maux de tête", "Toux", "Douleurs", "Grossesse", "Autre"];

export default function KiosqueTriage() {
  const { telephone } = useLocalSearchParams<{ telephone: string }>();
  const [motif, setMotif] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleNext = () => {
    const fullMotif = [motif, ...selected].filter(Boolean).join(", ") || "Consultation kiosque";
    router.push({
      pathname: "/(kiosque)/mesures",
      params: { telephone, motif: fullMotif },
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
        multiline
        value={motif}
        onChangeText={setMotif}
      />
      <Button label="Prendre les constantes" onPress={handleNext} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 8, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    color: colors.text,
    overflow: "hidden",
  },
  chipActive: {
    backgroundColor: "#D1FAE5",
    color: colors.green,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
    color: colors.text,
  },
});
