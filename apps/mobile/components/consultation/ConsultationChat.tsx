import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useConsultationChat } from "@/hooks/useConsultationChat";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/providers/ThemeProvider";

type Props = {
  consultationId: string;
  enabled?: boolean;
};

export function ConsultationChat({ consultationId, enabled = true }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles((c) => ({
    container: {
      marginTop: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      overflow: "hidden",
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
      padding: 14,
      paddingBottom: 8,
    },
    list: {
      minHeight: 120,
      maxHeight: 280,
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    loader: { marginVertical: 24 },
    empty: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: "center",
      marginVertical: 24,
      paddingHorizontal: 12,
    },
    bubbleWrap: { marginBottom: 8 },
    alignEnd: { alignItems: "flex-end" },
    alignStart: { alignItems: "flex-start" },
    bubble: {
      maxWidth: "85%",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    bubbleDoctor: {
      backgroundColor: c.chipBg,
      borderBottomLeftRadius: 4,
    },
    bubblePatient: {
      backgroundColor: c.green,
      borderBottomRightRadius: 4,
    },
    sender: { fontSize: 11, fontWeight: "600", color: c.green, marginBottom: 4 },
    senderPatient: { color: "#DCFCE7" },
    content: { fontSize: 14, color: c.text, lineHeight: 20 },
    contentPatient: { color: "#fff" },
    time: { fontSize: 10, color: c.textMuted, marginTop: 4, textAlign: "right" },
    timePatient: { color: "#ffffffaa" },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surfaceMuted,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 15,
      backgroundColor: c.inputBg,
      color: c.text,
    },
    sendBtn: {
      backgroundColor: c.green,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      minWidth: 72,
      alignItems: "center",
    },
    sendDisabled: { opacity: 0.5 },
    sendText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  }));

  const { messages, isLoading, sendMessage, isSending } = useConsultationChat(
    consultationId,
    enabled
  );
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim() || isSending) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages avec le médecin</Text>

      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator color={colors.green} style={styles.loader} />
        ) : messages.length === 0 ? (
          <Text style={styles.empty}>Aucun message pour l&apos;instant.</Text>
        ) : (
          messages.map((msg) => {
            const isPatient = msg.sender_role === "patient";
            return (
              <View
                key={msg.id}
                style={[styles.bubbleWrap, isPatient ? styles.alignEnd : styles.alignStart]}
              >
                <View style={[styles.bubble, isPatient ? styles.bubblePatient : styles.bubbleDoctor]}>
                  <Text style={[styles.sender, isPatient && styles.senderPatient]}>
                    {msg.sender_name}
                  </Text>
                  <Text style={[styles.content, isPatient && styles.contentPatient]}>
                    {msg.contenu}
                  </Text>
                  <Text style={[styles.time, isPatient && styles.timePatient]}>
                    {new Date(msg.envoye_le).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {enabled ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Écrire au médecin..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={4000}
          />
          <Pressable
            style={[styles.sendBtn, (!draft.trim() || isSending) && styles.sendDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendText}>Envoyer</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
