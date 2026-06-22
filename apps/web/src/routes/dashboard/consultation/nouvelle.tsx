import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, LoadingState } from "@/components/ui/dashboard";
import { useConsultations, usePatients } from "@/hooks/useDashboard";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/dashboard";

export const Route = createFileRoute("/dashboard/consultation/nouvelle")({
  component: NouvelleConsultationPage,
});

function NouvelleConsultationPage() {
  const navigate = useNavigate();
  const { data: patients, isLoading } = usePatients();
  const { data: consultations } = useConsultations();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    patient_id: "",
    motif: "",
    type_consultation: "video",
  });

  const createConsultation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/consultations", form);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      navigate({ to: "/dashboard/consultation/$id", params: { id: data.id } });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Consultation"
        description="Créer ou reprendre une téléconsultation"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createConsultation.mutate();
          }}
          className="card-section space-y-4"
        >
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Nouvelle consultation</h2>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Patient</label>
            <select
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients?.items?.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatPhone(p.telephone)} — {p.prefecture}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Motif</label>
            <textarea
              value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="Décrivez le motif de consultation..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <select
              value={form.type_consultation}
              onChange={(e) =>
                setForm({ ...form, type_consultation: e.target.value })
              }
              className="input-field"
            >
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
              <option value="chat">Chat</option>
              <option value="differe">Différé</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createConsultation.isPending || !form.patient_id}
            className="w-full py-2.5 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white font-medium disabled:opacity-50"
          >
            {createConsultation.isPending ? "Création..." : "Démarrer la consultation"}
          </button>
        </form>

        <div className="card-section">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Consultations en cours</h2>
          {consultations?.items?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune consultation.</p>
          ) : (
            <ul className="space-y-3">
              {consultations?.items?.slice(0, 8).map((c) => (
                <li key={c.id} className="list-item flex items-center justify-between">
                  <div>
                    <p className="text-sm capitalize text-gray-900 dark:text-white">{c.type_consultation}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.motif ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge statut={c.statut} />
                    <Link
                      to="/dashboard/consultation/$id"
                      params={{ id: c.id }}
                      className="text-xs text-artek-green hover:underline"
                    >
                      Ouvrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
