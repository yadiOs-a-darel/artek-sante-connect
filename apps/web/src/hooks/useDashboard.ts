import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
  consultations_aujourdhui: number;
  patients_actifs: number;
  rendez_vous_en_attente: number;
  kiosques_actifs: number;
  ordonnances_mois: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/api/v1/dashboard/stats");
      return data;
    },
  });
}

export interface Consultation {
  id: string;
  patient_id: string;
  medecin_id?: string;
  statut: string;
  type_consultation: string;
  motif?: string;
  debut_le?: string;
  fin_le?: string;
}

export function useConsultations(statut?: string) {
  return useQuery({
    queryKey: ["consultations", statut],
    queryFn: async () => {
      const params = statut ? { statut } : {};
      const { data } = await api.get<{ items: Consultation[]; total: number }>(
        "/api/v1/consultations",
        { params }
      );
      return data;
    },
  });
}

export interface Ordonnance {
  id: string;
  patient_id: string;
  consultation_id?: string;
  medicaments: Array<Record<string, string>>;
  qr_code?: string;
}

export function useOrdonnances() {
  return useQuery({
    queryKey: ["ordonnances"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Ordonnance[]; total: number }>(
        "/api/v1/ordonnances"
      );
      return data;
    },
  });
}

export interface RapportEpidemio {
  periode: string;
  total_patients: number;
  consultations_terminees: number;
  consultations_en_cours: number;
  consultations_en_attente: number;
  cas_malaria: number;
  cas_malnutrition: number;
  prefectures: Array<{ nom: string; consultations: number }>;
}

export function useRapportEpidemio() {
  return useQuery({
    queryKey: ["rapports", "epidemio"],
    queryFn: async () => {
      const { data } = await api.get<RapportEpidemio>("/api/v1/rapports/epidemio");
      return data;
    },
  });
}

export interface MedecinProfile {
  id: string;
  telephone: string;
  nom: string;
  specialite: string;
  prefecture: string;
  disponible: boolean;
  est_actif: boolean;
}

export function useMedecinProfile() {
  return useQuery({
    queryKey: ["medecin", "me"],
    queryFn: async () => {
      const { data } = await api.get<MedecinProfile>("/api/v1/medecins/me");
      return data;
    },
  });
}

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get<{
        items: Array<{
          id: string;
          telephone: string;
          nom?: string;
          prenom?: string;
          prefecture: string;
          village?: string;
        }>;
        total: number;
      }>("/api/v1/patients");
      return data;
    },
  });
}
