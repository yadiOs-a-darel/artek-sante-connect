import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Kiosque = {
  id: string;
  prefecture: string;
  village: string | null;
  statut: string;
  batterie_pct: number;
  connexion_ok: boolean;
  latitude: number | null;
  longitude: number | null;
};

export function useKiosques() {
  return useQuery({
    queryKey: ["kiosques"],
    queryFn: async () => {
      const { data } = await api.get<Kiosque[]>("/api/v1/kiosques");
      return data;
    },
    staleTime: 60_000,
  });
}
