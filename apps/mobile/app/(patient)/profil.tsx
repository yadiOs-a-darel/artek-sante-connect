import { useEffect, useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { formatPhoneRCA } from "@artek/shared-utils";
import { Card, Button, MobilePage, ThemeSelector } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/providers/ThemeProvider";
import { PREFECTURES } from "@/constants/specialites";

type PatientProfile = {
  id: string;
  telephone: string;
  nom?: string;
  prenom?: string;
  prefecture: string;
  village?: string;
  langue_preferee: string;
};

export default function ProfilScreen() {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const telephone = useAuthStore((s) => s.telephone);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [prefecture, setPrefecture] = useState<string>(PREFECTURES[0]);
  const [village, setVillage] = useState("");
  const [langue, setLangue] = useState<"fr" | "sg">("fr");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => {
      const { data } = await api.get<PatientProfile>("/api/v1/patients/me");
      return data;
    },
  });

  useEffect(() => {
    if (profile && !editing) {
      setNom(profile.nom ?? "");
      setPrenom(profile.prenom ?? "");
      setPrefecture(profile.prefecture);
      setVillage(profile.village ?? "");
      setLangue(profile.langue_preferee === "sg" ? "sg" : "fr");
    }
  }, [profile, editing]);

  const updateProfile = useMutation({
    mutationFn: () =>
      api.patch("/api/v1/patients/me", {
        nom: nom.trim(),
        prenom: prenom.trim(),
        prefecture,
        village: village.trim() || null,
        langue_preferee: langue,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-me"] });
      setEditing(false);
      Alert.alert("Profil mis à jour", "Vos informations ont été enregistrées.");
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? String(err.response?.data?.detail ?? "Mise à jour impossible")
        : "Mise à jour impossible";
      Alert.alert("Erreur", msg);
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.delete("/api/v1/patients/me"),
    onSuccess: async () => {
      await logout();
      router.replace("/(auth)/bienvenue");
    },
    onError: () => Alert.alert("Erreur", "Impossible de supprimer le compte pour le moment."),
  });

  const handleSave = () => {
    if (nom.trim().length < 2 || prenom.trim().length < 2) {
      Alert.alert("Formulaire incomplet", "Le nom et le prénom sont obligatoires.");
      return;
    }
    updateProfile.mutate();
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/bienvenue");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est définitive. Vos consultations, dossier et données seront effacés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            Alert.alert("Confirmation finale", "Confirmez-vous la suppression ?", [
              { text: "Non", style: "cancel" },
              {
                text: "Oui, supprimer",
                style: "destructive",
                onPress: () => deleteAccount.mutate(),
              },
            ]);
          },
        },
      ]
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: colors.bg },
        content: { flexGrow: 1, paddingBottom: 32 },
        profileCard: { width: "100%", alignItems: "center", paddingVertical: 24 },
        avatar: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: `${colors.green}20`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        },
        avatarText: { fontSize: 28, fontWeight: "800", color: colors.green },
        textCenter: { textAlign: "center", alignSelf: "center" },
        name: { fontSize: 22, fontWeight: "800", color: colors.text },
        phone: { fontSize: 15, color: colors.green, marginTop: 6 },
        meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
        label: { fontSize: 14, color: colors.textMuted, marginBottom: 8, marginTop: 12 },
        input: {
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: colors.text,
        },
        chips: { marginBottom: 8 },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: colors.chipBg,
          marginRight: 8,
        },
        chipActive: { backgroundColor: colors.green },
        chipText: { fontSize: 13, color: colors.textMuted },
        chipTextActive: { color: colors.chipActiveText, fontWeight: "600" },
        langRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
        row: { flexDirection: "row", gap: 8, marginTop: 8 },
        half: { flex: 1 },
        fullBtn: { width: "100%", alignSelf: "stretch" },
      }),
    [colors]
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <MobilePage
        title={editing ? "Modifier le profil" : "Mon profil"}
        subtitle={editing ? "Mettez à jour vos informations" : "Paramètres du compte"}
      >
        <Card style={!editing ? styles.profileCard : undefined}>
          {!editing ? (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile?.prenom?.[0] ?? "P").toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.name, styles.textCenter]}>
                {profile ? `${profile.prenom} ${profile.nom}` : isLoading ? "..." : "Patient"}
              </Text>
              <Text style={[styles.phone, styles.textCenter]}>
                {profile ? formatPhoneRCA(profile.telephone) : telephone ? `+236 ${telephone}` : ""}
              </Text>
              {profile && (
                <>
                  <Text style={[styles.meta, styles.textCenter]}>
                    {profile.prefecture}
                    {profile.village ? ` · ${profile.village}` : ""}
                  </Text>
                  <Text style={[styles.meta, styles.textCenter]}>
                    Langue : {profile.langue_preferee === "sg" ? "Sango" : "Français"}
                  </Text>
                </>
              )}
              <Button label="Modifier le profil" onPress={() => setEditing(true)} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />
              <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.input} value={nom} onChangeText={setNom} />
              <Text style={styles.label}>Préfecture *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                {PREFECTURES.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.chip, prefecture === p && styles.chipActive]}
                    onPress={() => setPrefecture(p)}
                  >
                    <Text style={[styles.chipText, prefecture === p && styles.chipTextActive]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.label}>Village</Text>
              <TextInput style={styles.input} value={village} onChangeText={setVillage} />
              <Text style={styles.label}>Langue préférée</Text>
              <View style={styles.langRow}>
                {(["fr", "sg"] as const).map((code) => (
                  <Pressable
                    key={code}
                    style={[styles.chip, langue === code && styles.chipActive]}
                    onPress={() => setLangue(code)}
                  >
                    <Text style={[styles.chipText, langue === code && styles.chipTextActive]}>
                      {code === "fr" ? "Français" : "Sango"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Button
                    label="Annuler"
                    variant="outline"
                    onPress={() => setEditing(false)}
                  />
                </View>
                <View style={styles.half}>
                  <Button
                    label="Enregistrer"
                    onPress={handleSave}
                    loading={updateProfile.isPending}
                  />
                </View>
              </View>
            </>
          )}
        </Card>

        {!editing && (
          <Card>
            <ThemeSelector />
          </Card>
        )}

        <Button label="Déconnexion" variant="outline" onPress={handleLogout} style={styles.fullBtn} />
        <Button
          label="Supprimer mon compte"
          variant="danger"
          onPress={handleDeleteAccount}
          loading={deleteAccount.isPending}
          style={styles.fullBtn}
        />
      </MobilePage>
    </ScrollView>
  );
}
