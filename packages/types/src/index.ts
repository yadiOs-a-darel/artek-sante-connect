export type UserRole = "patient" | "medecin" | "asc" | "admin" | "pharmacie";

export interface Patient {
  id: string;
  telephone: string;
  prefecture: string;
  village?: string;
  langue_preferee: string;
  est_actif: boolean;
}

export interface Medecin {
  id: string;
  specialite: string;
  prefecture: string;
  disponible: boolean;
}

export interface Consultation {
  id: string;
  patient_id: string;
  medecin_id?: string;
  statut: "en_attente" | "en_cours" | "terminee" | "annulee";
  type_consultation: "video" | "audio" | "differe" | "chat";
  motif?: string;
  salle_video_url?: string;
}

export interface Kiosque {
  id: string;
  prefecture: string;
  village?: string;
  statut: string;
  batterie_pct: number;
  connexion_ok: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
