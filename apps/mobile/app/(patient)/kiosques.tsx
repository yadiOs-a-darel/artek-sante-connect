import { Text, ScrollView, View, Pressable } from "react-native";
import { router } from "expo-router";
import { MobilePage, Card, Button, StatusPill } from "@/components/ui";
import { useKiosques } from "@/hooks/useKiosques";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/providers/ThemeProvider";

function BatteryBar({ pct }: { pct: number }) {
  const { colors } = useTheme();
  const tone = pct > 50 ? colors.green : pct > 20 ? colors.orange : colors.danger;
  const styles = useThemedStyles((c) => ({
    track: {
      height: 6,
      backgroundColor: c.chipBg,
      borderRadius: 3,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: 3 },
  }));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: tone }]} />
    </View>
  );
}

export default function KiosquesScreen() {
  const styles = useThemedStyles((colors) => ({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { flexGrow: 1, paddingBottom: 32 },
    muted: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
    kioskCard: { padding: 0, overflow: "hidden" },
    cardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      gap: 12,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: `${colors.orange}20`,
      alignItems: "center",
      justifyContent: "center",
    },
    icon: { fontSize: 24 },
    cardMain: { flex: 1 },
    name: { fontSize: 17, fontWeight: "700", color: colors.text },
    village: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
    id: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontFamily: "monospace" },
    metrics: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 16,
    },
    metric: { flex: 1 },
    metricLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
    metricValue: { fontSize: 12, color: colors.text, marginTop: 4, fontWeight: "600" },
    connexion: { fontSize: 14, fontWeight: "600", marginTop: 4 },
    online: { color: colors.green },
    offline: { color: colors.danger },
    useBtn: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
    },
    useBtnText: { color: colors.green, fontWeight: "700", fontSize: 15 },
    empty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
    },
  }));

  const { data: kiosques, isLoading, refetch, isFetching } = useKiosques();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <MobilePage
        title="Kiosques ASC"
        subtitle="Points de santé communautaires alimentés à l'énergie solaire"
      >
        {isLoading ? (
          <Text style={styles.muted}>Chargement des kiosques...</Text>
        ) : kiosques?.length ? (
          kiosques.map((k) => (
            <Card key={k.id} style={styles.kioskCard}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>☀️</Text>
                </View>
                <View style={styles.cardMain}>
                  <Text style={styles.name}>{k.prefecture}</Text>
                  <Text style={styles.village}>{k.village ?? "Village non renseigné"}</Text>
                  <Text style={styles.id}>{k.id}</Text>
                </View>
                <StatusPill
                  label={k.statut}
                  tone={k.statut === "actif" ? "green" : "gray"}
                />
              </View>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Batterie</Text>
                  <BatteryBar pct={k.batterie_pct} />
                  <Text style={styles.metricValue}>{k.batterie_pct}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Connexion</Text>
                  <Text style={[styles.connexion, k.connexion_ok ? styles.online : styles.offline]}>
                    {k.connexion_ok ? "● En ligne" : "○ Hors ligne"}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.useBtn}
                onPress={() =>
                  router.push({
                    pathname: "/(kiosque)/accueil",
                    params: { kiosqueId: k.id },
                  })
                }
              >
                <Text style={styles.useBtnText}>Utiliser ce kiosque</Text>
              </Pressable>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>☀️</Text>
            <Text style={styles.emptyTitle}>Aucun kiosque</Text>
            <Text style={styles.emptyText}>
              Les kiosques seront affichés dès qu&apos;ils seront enregistrés sur le réseau.
            </Text>
          </View>
        )}

        <Button
          label="Actualiser"
          variant="outline"
          onPress={() => refetch()}
          loading={isFetching}
        />
        <Button label="Retour à l'accueil" variant="secondary" onPress={() => router.back()} />
      </MobilePage>
    </ScrollView>
  );
}
