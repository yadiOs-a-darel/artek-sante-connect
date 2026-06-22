import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PageHeader,
  LoadingState,
  EmptyState,
} from "@/components/ui/dashboard";
import { usePatients } from "@/hooks/useDashboard";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/patients/")({
  component: PatientsPage,
});

function PatientsPage() {
  const { data, isLoading } = usePatients();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    telephone: "",
    nom: "",
    prenom: "",
    prefecture: "Bangui",
  });
  const queryClient = useQueryClient();

  const createPatient = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/patients", form);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
      setForm({ telephone: "", nom: "", prenom: "", prefecture: "Bangui" });
    },
  });

  const filtered =
    data?.items?.filter(
      (p) =>
        p.telephone.includes(search) ||
        p.prefecture.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${data?.total ?? 0} patient(s) enregistré(s)`}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau patient
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPatient.mutate();
          }}
          className="mb-6 p-5 rounded-xl surface border grid sm:grid-cols-2 gap-4"
        >
          <input
            placeholder="Téléphone (7XXXXXXX)"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="input-field"
            required
            pattern="7\d{7}"
          />
          <input
            placeholder="Préfecture"
            value={form.prefecture}
            onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            className="input-field"
            required
          />
          <input
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="input-field"
            required
          />
          <input
            placeholder="Prénom"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            className="input-field"
            required
          />
          <button
            type="submit"
            disabled={createPatient.isPending}
            className="sm:col-span-2 py-2 rounded-lg bg-artek-green text-white font-medium disabled:opacity-50"
          >
            {createPatient.isPending ? "Enregistrement..." : "Enregistrer le patient"}
          </button>
        </form>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          placeholder="Rechercher par téléphone ou préfecture..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Aucun patient trouvé." />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/dashboard/patients/$id"
              params={{ id: p.id }}
              className="list-row hover:border-artek-green/50"
            >
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{formatPhone(p.telephone)}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {p.prefecture}
                  {p.village && ` · ${p.village}`}
                </p>
              </div>
              <span className="text-artek-green text-sm">Voir fiche →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
