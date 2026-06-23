import { Alert } from "react-native";
import * as Linking from "expo-linking";

/** Ouvre une URL HTTPS (Google Meet, etc.) dans le navigateur système. */
export async function openExternalUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) return;

  if (trimmed.includes("meet.google.com/new")) {
    Alert.alert(
      "Lien Meet invalide",
      "Ce lien ne permet pas de rejoindre une réunion. Le médecin doit configurer un lien Meet avec un code (ex. abc-defg-hij) dans le fichier .env du serveur."
    );
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(trimmed);
    if (!canOpen) {
      throw new Error("URL non supportée");
    }
    await Linking.openURL(trimmed);
  } catch {
    Alert.alert(
      "Impossible d'ouvrir le lien",
      `Ouvrez ce lien dans Chrome ou Google Meet :\n\n${trimmed}`
    );
  }
}
