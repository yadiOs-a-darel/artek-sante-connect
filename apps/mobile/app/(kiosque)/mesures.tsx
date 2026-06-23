import { useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Card, Button } from "@/components/ui";
import { useThemedStyles } from "@/hooks/useThemedStyles";

export default function KiosqueMesures() {
  const { telephone, motif, kiosqueId } = useLocalSearchParams<{
    telephone: string;
    motif: string;
    kiosqueId?: string;
  }>();
  const [simulated, setSimulated] = useState(false);

  const styles = useThemedStyles((colors) => ({
    label: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
    value: { fontSize: 20, fontWeight: "600", color: colors.text },
    hint: { fontSize: 12, color: colors.textMuted, marginTop: 16, lineHeight: 18 },
  }));

  const simulateMeasures = () => {
    setSimulated(true);
  };

  const handleNext = () => {
    router.push({
      pathname: "/(kiosque)/consultation",
      params: {
        telephone,
        motif: motif || "Consultation kiosque",
        kiosqueId: kiosqueId || "kiosk-bangui-01",
        tension: simulated ? "120/80" : "",
        spo2: simulated ? "98" : "",
        temperature: simulated ? "36.8" : "",
      },
    });
  };

  return (
    <Screen title="Constantes vitales" subtitle="Capteurs BLE — simulation en dev">
      <Card>
        <Text style={styles.label}>Tension artérielle</Text>
        <Text style={styles.value}>{simulated ? "120/80 mmHg" : "—"}</Text>
        <Text style={styles.label}>SpO₂</Text>
        <Text style={styles.value}>{simulated ? "98 %" : "—"}</Text>
        <Text style={styles.label}>Température</Text>
        <Text style={styles.value}>{simulated ? "36.8 °C" : "—"}</Text>
      </Card>
      {!simulated && (
        <Button label="Simuler lecture capteurs (dev)" variant="secondary" onPress={simulateMeasures} />
      )}
      <Button
        label="Lancer la consultation"
        onPress={handleNext}
        disabled={!simulated}
      />
      <Text style={styles.hint}>
        En production : connexion BLE aux capteurs Omron / oxymètre via react-native-ble-plx
      </Text>
    </Screen>
  );
}
