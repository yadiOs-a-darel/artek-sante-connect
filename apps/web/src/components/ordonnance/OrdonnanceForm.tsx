import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type OrdonnanceFormValues = {
  patient_id: string;
  consultation_id?: string;
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions: string;
};

const emptyForm = (defaults?: Partial<OrdonnanceFormValues>): OrdonnanceFormValues => ({
  patient_id: defaults?.patient_id ?? "",
  consultation_id: defaults?.consultation_id,
  nom: "",
  dosage: "",
  frequence: "",
  duree: "",
  instructions: "",
});

interface OrdonnanceFormProps {
  defaults?: Partial<OrdonnanceFormValues>;
  patients?: Array<{ id: string; telephone: string }>;
  showPatientSelect?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function OrdonnanceForm({
  defaults,
  patients,
  showPatientSelect = true,
  submitLabel = "Générer l'ordonnance + QR",
  onSuccess,
  compact = false,
}: OrdonnanceFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => emptyForm(defaults));
  const [error, setError] = useState("");

  const createOrdonnance = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/ordonnances", {
        patient_id: form.patient_id,
        consultation_id: form.consultation_id || undefined,
        medicaments: [
          {
            nom: form.nom,
            dosage: form.dosage,
            frequence: form.frequence,
            duree: form.duree,
          },
        ],
        instructions: form.instructions || undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordonnances"] });
      setForm(emptyForm(defaults));
      setError("");
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Impossible de créer l'ordonnance.";
      setError(String(detail));
    },
  });

  const grid = compact ? "grid gap-3" : "grid sm:grid-cols-2 gap-4";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        createOrdonnance.mutate();
      }}
      className={`${grid} ${compact ? "" : "p-5 rounded-xl surface border mb-6"}`}
    >
      {showPatientSelect && patients && (
        <select
          value={form.patient_id}
          onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          className="sm:col-span-2 input-field"
          required
        >
          <option value="">Patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              +236 {p.telephone}
            </option>
          ))}
        </select>
      )}
      <input
        placeholder="Médicament"
        value={form.nom}
        onChange={(e) => setForm({ ...form, nom: e.target.value })}
        className="input-field"
        required
      />
      <input
        placeholder="Dosage (ex: 500mg)"
        value={form.dosage}
        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
        className="input-field"
        required
      />
      <input
        placeholder="Fréquence (ex: 2x/jour)"
        value={form.frequence}
        onChange={(e) => setForm({ ...form, frequence: e.target.value })}
        className="input-field"
        required
      />
      <input
        placeholder="Durée (ex: 7 jours)"
        value={form.duree}
        onChange={(e) => setForm({ ...form, duree: e.target.value })}
        className="input-field"
        required
      />
      <textarea
        placeholder="Instructions (optionnel)"
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        className="sm:col-span-2 input-field h-20 resize-none"
      />
      {error ? <p className="sm:col-span-2 text-xs text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={createOrdonnance.isPending || !form.patient_id}
        className="sm:col-span-2 py-2 rounded-lg bg-artek-green text-white font-medium disabled:opacity-50"
      >
        {createOrdonnance.isPending ? "Génération..." : submitLabel}
      </button>
    </form>
  );
}

export async function downloadOrdonnancePdf(ordonnanceId: string, filename: string) {
  const { data } = await api.get(`/api/v1/ordonnances/${ordonnanceId}/pdf`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function loadOrdonnanceQrUrl(ordonnanceId: string): Promise<string> {
  const { data } = await api.get(`/api/v1/ordonnances/${ordonnanceId}/qr`, {
    responseType: "blob",
  });
  return URL.createObjectURL(data);
}
