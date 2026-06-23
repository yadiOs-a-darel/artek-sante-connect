import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Screen, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/providers/ThemeProvider";
import { SPECIALITES } from "@/constants/specialites";

type Medecin = {
  id: string;
  nom?: string;
  specialite: string;
  prefecture: string;
  disponible: boolean;
};

const SYMPTOMES = ["Fièvre", "Maux de tête", "Toux", "Douleurs", "Éruption cutanée", "Autre"];

export default function NouvelleDemandeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles((c) => ({
    scroll: { flex: 1, backgroundColor: c.bg },
    content: { flexGrow: 1, paddingBottom: 32 },
    cardTitle: { fontSize: 16, fontWeight: "600", color: c.text, marginBottom: 12 },
    hint: { fontSize: 13, color: c.textMuted, marginBottom: 12 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.chipBg,
    },
    chipActive: { backgroundColor: c.green },
    chipText: { fontSize: 13, color: c.textMuted },
    chipTextActive: { color: c.chipActiveText, fontWeight: "600" },
    textArea: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: c.inputBg,
      color: c.text,
      marginBottom: 16,
      textAlignVertical: "top",
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    field: { flex: 1 },
    label: { fontSize: 12, color: c.textMuted, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: c.inputBg,
      color: c.text,
      fontSize: 16,
    },
    specScroll: { marginBottom: 12 },
    medecinRow: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 8,
      backgroundColor: c.card,
    },
    medecinSelected: { borderColor: c.green, backgroundColor: c.successBg },
    medecinHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    medecinNom: { fontWeight: "600", color: c.text, flex: 1 },
    medecinSpecialite: { fontSize: 14, fontWeight: "500", color: c.green, marginTop: 4 },
    medecinMeta: { fontSize: 13, color: c.textMuted, marginTop: 2 },
    disponibleBadge: {
      fontSize: 11,
      fontWeight: "600",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    disponibleOui: { backgroundColor: c.successBg, color: c.green },
    disponibleNon: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    recap: { fontSize: 14, color: c.text, marginBottom: 8 },
    nav: { flexDirection: "row", gap: 8, marginTop: 16 },
  }));

  const [step, setStep] = useState(1);
  const [specialite, setSpecialite] = useState<string | null>(null);
  const [symptomes, setSymptomes] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [tensionSys, setTensionSys] = useState("120");
  const [tensionDia, setTensionDia] = useState("80");
  const [spo2, setSpo2] = useState("98");
  const [temperature, setTemperature] = useState("36.8");
  const [medecinId, setMedecinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: medecins, isLoading } = useQuery({
    queryKey: ["medecins", "tous"],
    queryFn: async () => {
      const { data } = await api.get<Medecin[]>("/api/v1/medecins/disponibles");
      return data;
    },
    enabled: step >= 3,
  });

  const medecinsFiltres =
    specialite != null
      ? medecins?.filter((m) => m.specialite === specialite) ?? []
      : medecins ?? [];

  const toggleSymptome = (s: string) => {
    setSymptomes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const symptomesTexte = [...symptomes, details.trim()].filter(Boolean).join(" — ");

  const submit = async () => {
    if (!medecinId || symptomesTexte.length < 3) {
      Alert.alert("Incomplet", "Sélectionnez un médecin et décrivez vos symptômes");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/consultations/demande", {
        medecin_id: medecinId,
        symptomes: symptomesTexte,
        specialite_souhaitee: specialite ?? undefined,
        type_consultation: "video",
        mesures: {
          tension_sys: parseFloat(tensionSys) || undefined,
          tension_dia: parseFloat(tensionDia) || undefined,
          spo2: parseFloat(spo2) || undefined,
          temperature: parseFloat(temperature) || undefined,
        },
      });
      Alert.alert(
        "Demande envoyée",
        "Le médecin va examiner votre demande et vous répondre dans l'application.",
        [{ text: "OK", onPress: () => router.replace(`/(patient)/consultation/${data.id}`) }]
      );
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? String(err.response?.data?.detail ?? "Envoi impossible")
        : "Envoi impossible";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Screen title="Demande de consultation" subtitle={`Étape ${step} / 4`}>
        {step === 1 && (
          <Card>
            <Text style={styles.cardTitle}>Décrivez vos symptômes</Text>
            <View style={styles.chips}>
              {SYMPTOMES.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, symptomes.includes(s) && styles.chipActive]}
                  onPress={() => toggleSymptome(s)}
                >
                  <Text style={[styles.chipText, symptomes.includes(s) && styles.chipTextActive]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Précisez vos symptômes..."
              multiline
              value={details}
              onChangeText={setDetails}
            />
            <Button label="Suivant" onPress={() => setStep(2)} />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <Text style={styles.cardTitle}>Constantes vitales</Text>
            <Text style={styles.hint}>Saisissez vos mesures ou laissez les valeurs par défaut</Text>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>TA sys</Text>
                <TextInput style={styles.input} value={tensionSys} onChangeText={setTensionSys} keyboardType="numeric" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>TA dia</Text>
                <TextInput style={styles.input} value={tensionDia} onChangeText={setTensionDia} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>SpO₂ %</Text>
                <TextInput style={styles.input} value={spo2} onChangeText={setSpo2} keyboardType="numeric" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Temp °C</Text>
                <TextInput style={styles.input} value={temperature} onChangeText={setTemperature} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={styles.nav}>
              <Button label="Retour" variant="outline" onPress={() => setStep(1)} />
              <Button label="Suivant" onPress={() => setStep(3)} />
            </View>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Text style={styles.cardTitle}>Choisir un médecin</Text>
            <Text style={styles.hint}>
              Tous les médecins inscrits — filtrez par spécialité si besoin
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specScroll}>
              <Pressable
                style={[styles.chip, specialite === null && styles.chipActive]}
                onPress={() => {
                  setSpecialite(null);
                  setMedecinId(null);
                }}
              >
                <Text style={[styles.chipText, specialite === null && styles.chipTextActive]}>
                  Toutes
                </Text>
              </Pressable>
              {SPECIALITES.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, specialite === s && styles.chipActive]}
                  onPress={() => {
                    setSpecialite(s);
                    setMedecinId(null);
                  }}
                >
                  <Text style={[styles.chipText, specialite === s && styles.chipTextActive]}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {isLoading ? (
              <Text style={styles.hint}>Chargement des médecins...</Text>
            ) : medecinsFiltres.length ? (
              medecinsFiltres.map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.medecinRow, medecinId === m.id && styles.medecinSelected]}
                  onPress={() => setMedecinId(m.id)}
                >
                  <View style={styles.medecinHeader}>
                    <Text style={styles.medecinNom}>{m.nom || "Médecin"}</Text>
                    <Text
                      style={[
                        styles.disponibleBadge,
                        m.disponible ? styles.disponibleOui : styles.disponibleNon,
                      ]}
                    >
                      {m.disponible ? "Disponible" : "Occupé"}
                    </Text>
                  </View>
                  <Text style={styles.medecinSpecialite}>{m.specialite}</Text>
                  <Text style={styles.medecinMeta}>{m.prefecture}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.hint}>Aucun médecin pour ce filtre.</Text>
            )}
            <View style={styles.nav}>
              <Button label="Retour" variant="outline" onPress={() => setStep(2)} />
              <Button label="Suivant" onPress={() => setStep(4)} disabled={!medecinId} />
            </View>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <Text style={styles.cardTitle}>Récapitulatif</Text>
            <Text style={styles.recap}>
              Médecin :{" "}
              {medecins?.find((m) => m.id === medecinId)?.nom || "Sélectionné"}
              {medecins?.find((m) => m.id === medecinId)?.specialite
                ? ` (${medecins.find((m) => m.id === medecinId)?.specialite})`
                : ""}
            </Text>
            <Text style={styles.recap}>Symptômes : {symptomesTexte}</Text>
            <Text style={styles.recap}>
              Constantes : {tensionSys}/{tensionDia} mmHg · SpO₂ {spo2}% · {temperature}°C
            </Text>
            <Text style={styles.hint}>
              Le médecin validera ou refusera votre demande. Vous recevrez sa réponse dans l&apos;app.
            </Text>
            <View style={styles.nav}>
              <Button label="Retour" variant="outline" onPress={() => setStep(3)} />
              <Button label="Envoyer la demande" onPress={submit} loading={loading} />
            </View>
          </Card>
        )}
      </Screen>
    </ScrollView>
  );
}
