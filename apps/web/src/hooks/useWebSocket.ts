import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useWebSocket(consultationId: string) {
  const [constantes, setConstantes] = useState<Record<string, unknown>>({});
  const [messages, setMessages] = useState<unknown[]>([]);

  useEffect(() => {
    if (!consultationId) return;

    const wsUrl = API_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/api/v1/ws/consultation/${consultationId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "constantes") {
        setConstantes(data.payload);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.close();
  }, [consultationId]);

  return { constantes, messages };
}
