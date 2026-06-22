import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, QrCode } from "lucide-react";
import {
  PageHeader,
  LoadingState,
  EmptyState,
} from "@/components/ui/dashboard";
import { useOrdonnances, usePatients } from "@/hooks/useDashboard";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/ordonnances/")({
  component: OrdonnancesPage,
});

function OrdonnancesPage() {
  const { data, isLoading } = useOrdonnances();
  const { data: patients } = usePatients();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    nom: "",
    dosage: "",
    frequence: "",
    duree: "",
    instructions: "",
  });

  const patientMap = new Map(patients?.items?.map((p) => [p.id, p]) ?? []);

  const createOrdonnance = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/ordonnances", {
        patient_id: form.patient_id,
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
      setShowForm(false);
      setForm({
        patient_id: "",
        nom: "",
        dosage: "",
        frequence: "",
        duree: "",
        instructions: "",
      });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Ordonnances"
        description={`${data?.total ?? 0} ordonnance(s) numérique(s)`}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouvelle ordonnance
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createOrdonnance.mutate();
          }}
          className="mb-6 p-5 rounded-xl surface border grid sm:grid-cols-2 gap-4"
        >
          <select
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="sm:col-span-2 input-field"
            required
          >
            <option value="">Patient</option>
            {patients?.items?.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPhone(p.telephone)}
              </option>
            ))}
          </select>
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
          <button
            type="submit"
            disabled={createOrdonnance.isPending}
            className="sm:col-span-2 py-2 rounded-lg bg-artek-green text-white font-medium disabled:opacity-50"
          >
            {createOrdonnance.isPending ? "Génération..." : "Générer l'ordonnance + QR"}
          </button>
        </form>
      )}

      {data?.items?.length === 0 ? (
        <EmptyState message="Aucune ordonnance. Créez-en une pour un patient." />
      ) : (
        <div className="space-y-3">
          {data?.items?.map((o) => {
            const patient = patientMap.get(o.patient_id);
            const meds = o.medicaments.filter((m) => m.nom);
            return (
              <div
                key={o.id}
                className="list-row"
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {patient ? formatPhone(patient.telephone) : "Patient"}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {meds.map((m, i) => (
                        <li key={i} className="text-sm text-gray-500 dark:text-gray-400">
                          {m.nom} — {m.dosage}, {m.frequence}, {m.duree}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {o.qr_code && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg surface-muted border border-gray-200 dark:border-gray-700 text-sm">
                      <QrCode className="w-4 h-4 text-artek-green" />
                      <code className="text-artek-green">{o.qr_code}</code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
