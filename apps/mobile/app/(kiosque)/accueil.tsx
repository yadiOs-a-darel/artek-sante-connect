import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useThemedStyles } from "@/hooks/useThemedStyles";

export default function KiosqueAccueil() {
  const { kiosqueId } = useLocalSearchParams<{ kiosqueId?: string }>();
  const kiosk = kiosqueId || "kiosk-bangui-01";

  const styles = useThemedStyles((colors) => ({
    safe: { flex: 1, backgroundColor: colors.bg },
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: 40,
    },
    hero: { alignItems: "center", marginBottom: 40 },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: `${colors.orange}18`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      borderWidth: 2,
      borderColor: `${colors.orange}40`,
    },
    emoji: { fontSize: 44 },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 14,
      lineHeight: 24,
      maxWidth: 300,
    },
    kioskId: { fontSize: 12, color: colors.textMuted, marginTop: 12, fontFamily: "monospace" },
    actions: { width: "100%", gap: 4 },
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>☀️</Text>
          </View>
          <Text style={styles.title}>Kiosque ARTEK</Text>
          <Text style={styles.subtitle}>
            Point de santé communautaire — identification, triage, mesures et téléconsultation
          </Text>
          <Text style={styles.kioskId}>{kiosk}</Text>
        </View>
        <View style={styles.actions}>
          <Button
            label="Commencer le parcours"
            onPress={() =>
              router.push({
                pathname: "/(kiosque)/patient",
                params: { kiosqueId: kiosk },
              })
            }
          />
          <Button
            label="Retour à l'accueil patient"
            variant="outline"
            onPress={() => router.replace("/(patient)/accueil")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
