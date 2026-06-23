import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/utils";
import { RCA_PREFECTURES } from "@/constants/rca";

export interface PatientData {
  id: string;
  telephone: string;
  nom?: string;
  prenom?: string;
  prefecture: string;
  village?: string;
  est_actif?: boolean;
}

interface PatientEditFormProps {
  patient: PatientData;
  onSaved?: () => void;
  onDeleted?: () => void;
  compact?: boolean;
}

export function PatientEditForm({ patient, onSaved, onDeleted, compact }: PatientEditFormProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: patient.nom ?? "",
    prenom: patient.prenom ?? "",
    prefecture: patient.prefecture,
    village: patient.village ?? "",
    est_actif: patient.est_actif ?? true,
  });

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/api/v1/patients/${patient.id}`, {
        nom: form.nom,
        prenom: form.prenom,
        prefecture: form.prefecture,
        village: form.village || null,
        est_actif: form.est_actif,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patient.id] });
      setEditing(false);
      onSaved?.();
    },
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/api/v1/patients/${patient.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onDeleted?.();
    },
  });

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate();
        }}
        className="space-y-3"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            placeholder="Prénom"
            className="input-field"
            required
          />
          <input
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Nom"
            className="input-field"
            required
          />
          <select
            value={form.prefecture}
            onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            className="input-field"
            required
          >
            {RCA_PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            value={form.village}
            onChange={(e) => setForm({ ...form, village: e.target.value })}
            placeholder="Village (optionnel)"
            className="input-field"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={form.est_actif}
            onChange={(e) => setForm({ ...form, est_actif: e.target.checked })}
            className="rounded"
          />
          Patient actif
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="px-4 py-2 rounded-lg bg-artek-green text-white text-sm font-medium disabled:opacity-50"
          >
            {update.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-lg btn-secondary text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={compact ? "flex items-center justify-between gap-3" : "space-y-4"}>
      {!compact && (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">Nom</dt>
            <dd className="text-gray-900 dark:text-white text-right">
              {patient.prenom} {patient.nom}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">Téléphone</dt>
            <dd className="text-gray-900 dark:text-white">{formatPhone(patient.telephone)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">Préfecture</dt>
            <dd className="text-gray-900 dark:text-white">{patient.prefecture}</dd>
          </div>
          {patient.village && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Village</dt>
              <dd className="text-gray-900 dark:text-white">{patient.village}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">Statut</dt>
            <dd className={patient.est_actif === false ? "text-red-500" : "text-artek-green"}>
              {patient.est_actif === false ? "Inactif" : "Actif"}
            </dd>
          </div>
        </dl>
      )}
      <div className={`flex gap-2 shrink-0 ${compact ? "" : "pt-2 border-t border-gray-200 dark:border-gray-700"}`}>
        <button
          type="button"
          onClick={() => {
            setForm({
              nom: patient.nom ?? "",
              prenom: patient.prenom ?? "",
              prefecture: patient.prefecture,
              village: patient.village ?? "",
              est_actif: patient.est_actif ?? true,
            });
            setEditing(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm"
          title="Modifier"
        >
          <Pencil className="w-4 h-4" />
          {!compact && "Modifier"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                `Supprimer ${patient.prenom} ${patient.nom} ? Ses consultations et ordonnances seront aussi supprimées.`
              )
            ) {
              remove.mutate();
            }
          }}
          disabled={remove.isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 text-sm disabled:opacity-50"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
          {!compact && "Supprimer"}
        </button>
      </div>
    </div>
  );
}
