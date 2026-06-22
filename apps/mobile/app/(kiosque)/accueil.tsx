import { Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";
import { colors } from "@/constants/theme";

export default function KiosqueAccueil() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🏥</Text>
        <Text style={styles.title}>Kiosque ARTEK</Text>
        <Text style={styles.subtitle}>
          Point de santé communautaire — identification, triage et téléconsultation
        </Text>
      </View>
      <Button label="Commencer" onPress={() => router.push("/(kiosque)/patient")} />
      <Button
        label="Retour accueil"
        variant="outline"
        onPress={() => router.replace("/(auth)/bienvenue")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: "center",
  },
  hero: { alignItems: "center", marginBottom: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});
