import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_role: "medecin" | "patient";
  sender_name: string;
  contenu: string;
  envoye_le: string;
}

export function useConsultationChat(consultationId: string) {
  const queryClient = useQueryClient();
  const [incoming, setIncoming] = useState<ChatMessage[]>([]);
  const seenIds = useRef(new Set<string>());

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["chat", consultationId],
    queryFn: async () => {
      const { data } = await api.get<ChatMessage[]>(
        `/api/v1/consultations/${consultationId}/messages`
      );
      return data;
    },
    enabled: !!consultationId,
  });

  useEffect(() => {
    history.forEach((m) => seenIds.current.add(m.id));
  }, [history]);

  useEffect(() => {
    if (!consultationId) return;

    const wsUrl = API_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/api/v1/ws/consultation/${consultationId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && data.payload?.id) {
          const msg = data.payload as ChatMessage;
          if (seenIds.current.has(msg.id)) return;
          seenIds.current.add(msg.id);
          setIncoming((prev) => [...prev, msg]);
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => ws.close();
  }, [consultationId]);

  const messages = useMemo(() => {
    const merged = new Map<string, ChatMessage>();
    [...history, ...incoming].forEach((m) => merged.set(m.id, m));
    return Array.from(merged.values()).sort(
      (a, b) => new Date(a.envoye_le).getTime() - new Date(b.envoye_le).getTime()
    );
  }, [history, incoming]);

  const sendMutation = useMutation({
    mutationFn: async (contenu: string) => {
      const { data } = await api.post<ChatMessage>(
        `/api/v1/consultations/${consultationId}/messages`,
        { contenu }
      );
      return data;
    },
    onSuccess: (msg) => {
      if (!seenIds.current.has(msg.id)) {
        seenIds.current.add(msg.id);
        setIncoming((prev) => [...prev, msg]);
      }
      queryClient.invalidateQueries({ queryKey: ["chat", consultationId] });
    },
  });

  const sendMessage = useCallback(
    (contenu: string) => {
      const text = contenu.trim();
      if (!text) return;
      sendMutation.mutate(text);
    },
    [sendMutation]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMutation.isPending,
    error: sendMutation.error,
  };
}
