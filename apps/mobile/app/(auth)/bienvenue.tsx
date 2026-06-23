import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";
import { colors } from "@/constants/theme";

export default function BienvenueScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>♥</Text>
        </View>
        <Text style={styles.title}>ARTEK Connect Santé</Text>
        <Text style={styles.subtitle}>
          Télémédecine solaire pour la République Centrafricaine
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Créer un compte"
          variant="outline"
          onPress={() => router.push({ pathname: "/(auth)/telephone", params: { mode: "register" } })}
        />
        <Button label="Se connecter" onPress={() => router.push({ pathname: "/(auth)/telephone", params: { mode: "login" } })} />
        <Button
          label="Mode kiosque ASC"
          variant="outline"
          onPress={() => router.push("/(kiosque)/accueil")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: "space-between",
    paddingBottom: 48,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 36,
    color: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  actions: {
    gap: 4,
  },
});
