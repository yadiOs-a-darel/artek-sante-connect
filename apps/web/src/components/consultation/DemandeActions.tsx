import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api";

interface DemandeActionsProps {
  consultationId: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatLocalDateTime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultRendezVousLocal(): string {
  return formatLocalDateTime(new Date(Date.now() + 60 * 60 * 1000));
}

function minRendezVousLocal(): string {
  return formatLocalDateTime(new Date(Date.now() + 5 * 60 * 1000));
}

function extractApiError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Impossible d'enregistrer la réponse.";
  }
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg ?? String(item)).join(", ");
  }
  return "Impossible d'enregistrer la réponse.";
}

export function DemandeActions({ consultationId }: DemandeActionsProps) {
  const queryClient = useQueryClient();
  const [reponse, setReponse] = useState("");
  const [programmeeLe, setProgrammeeLe] = useState(defaultRendezVousLocal);
  const [error, setError] = useState("");

  const repondre = useMutation({
    mutationFn: (action: "accepter" | "refuser") => {
      const payload: {
        action: string;
        reponse_medecin: string;
        programmee_le?: string;
      } = {
        action,
        reponse_medecin:
          reponse.trim() ||
          (action === "accepter"
            ? "Votre demande est acceptée. Consultation vidéo programmée."
            : "Votre demande ne peut pas être honorée pour le moment."),
      };

      if (action === "accepter") {
        const selected = new Date(programmeeLe);
        if (Number.isNaN(selected.getTime())) {
          throw new Error("Date de rendez-vous invalide.");
        }
        if (selected.getTime() <= Date.now()) {
          throw new Error(
            "La date choisie est déjà passée. Sélectionnez un créneau dans le futur."
          );
        }
        payload.programmee_le = selected.toISOString();
      }

      return api.patch(`/api/v1/consultations/${consultationId}/repondre`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      setReponse("");
      setError("");
      setProgrammeeLe(defaultRendezVousLocal());
    },
    onError: (err: unknown) => {
      if (err instanceof Error && !axios.isAxiosError(err)) {
        setError(err.message);
        return;
      }
      setError(extractApiError(err));
    },
  });

  const handleAccepter = () => {
    setError("");
    repondre.mutate("accepter");
  };

  const handleRefuser = () => {
    if (!reponse.trim()) {
      setError("Un message est obligatoire pour refuser la demande.");
      return;
    }
    setError("");
    repondre.mutate("refuser");
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
        Date et heure du rendez-vous
      </label>
      <input
        type="datetime-local"
        value={programmeeLe}
        min={minRendezVousLocal()}
        onChange={(e) => setProgrammeeLe(e.target.value)}
        className="input-field text-sm"
      />
      <textarea
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
        placeholder="Message au patient (obligatoire en cas de refus)"
        className="input-field text-sm min-h-[60px]"
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAccepter}
          disabled={repondre.isPending || !programmeeLe}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-artek-green text-white text-sm disabled:opacity-50"
        >
          <Check className="w-3 h-3" />
          Accepter
        </button>
        <button
          type="button"
          onClick={handleRefuser}
          disabled={repondre.isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          Refuser
        </button>
      </div>
    </div>
  );
}
