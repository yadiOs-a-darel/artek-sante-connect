import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { colors } from "@/constants/theme";

export default function Index() {
  const { hydrated: authReady, accessToken, role } = useAuthStore();
  const { hydrated: onboardingReady, completed } = useOnboardingStore();

  if (!authReady || !onboardingReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!completed) {
    return <Redirect href="/(onboarding)" />;
  }

  if (accessToken && role === "patient") {
    return <Redirect href="/(patient)/accueil" />;
  }

  return <Redirect href="/(auth)/bienvenue" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
});
