import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface VideoSession {
  configured: boolean;
  room_url: string;
  room_name: string;
  token: string;
  domain: string;
  message?: string | null;
}

export function useVideoCall(consultationId: string, enabled = true) {
  return useQuery({
    queryKey: ["video-session", consultationId],
    queryFn: async () => {
      const { data } = await api.get<VideoSession>(
        `/api/v1/consultations/${consultationId}/video`
      );
      return data;
    },
    enabled: !!consultationId && enabled,
    retry: 1,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
