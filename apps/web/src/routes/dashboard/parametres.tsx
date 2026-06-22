import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, User, Users, Video, FileText, Palette } from "lucide-react";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { PageHeader, LoadingState, StatusBadge } from "@/components/ui/dashboard";
import {
  useMedecinProfile,
  usePatients,
  useConsultations,
  useOrdonnances,
} from "@/hooks/useDashboard";
import { api } from "@/lib/api";
import { formatPhone, cn } from "@/lib/utils";

type Tab = "profil" | "apparence" | "patients" | "consultations" | "ordonnances";

export const Route = createFileRoute("/dashboard/parametres")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as Tab) || "profil",
  }),
  component: ParametresPage,
});

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profil", label: "Mon profil", icon: User },
  { id: "apparence", label: "Apparence", icon: Palette },
  { id: "patients", label: "Patients", icon: Users },
  { id: "consultations", label: "Consultations", icon: Video },
  { id: "ordonnances", label: "Ordonnances", icon: FileText },
];

function ParametresPage() {
  const { tab: activeTab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>(activeTab);

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const switchTab = (t: Tab) => {
    setTab(t);
    navigate({ search: { tab: t } });
  };

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Gérez votre compte et vos données médicales"
      />

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:w-48 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition",
                tab === t.id
                  ? "bg-artek-green/20 text-artek-green"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {tab === "profil" && <ProfilTab />}
          {tab === "apparence" && <ApparenceTab />}
          {tab === "patients" && <PatientsGestionTab />}
          {tab === "consultations" && <ConsultationsGestionTab />}
          {tab === "ordonnances" && <OrdonnancesGestionTab />}
        </div>
      </div>
    </div>
  );
}

function ApparenceTab() {
  return (
    <div className="space-y-4">
      <ThemeSelector />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Votre préférence est enregistrée automatiquement sur cet appareil.
      </p>
    </div>
  );
}

function ProfilTab() {
  const { data: profile, isLoading } = useMedecinProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ specialite: "", prefecture: "", disponible: true });
  const [pinForm, setPinForm] = useState({ ancien_pin: "", nouveau_pin: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        specialite: profile.specialite,
        prefecture: profile.prefecture,
        disponible: profile.disponible,
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const updateProfile = useMutation({
    mutationFn: () => api.patch("/api/v1/medecins/me", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medecin", "me"] });
      setMessage("Profil mis à jour");
      setError("");
    },
    onError: () => setError("Erreur lors de la mise à jour"),
  });

  const changePin = useMutation({
    mutationFn: () => api.post("/api/v1/medecins/me/pin", pinForm),
    onSuccess: () => {
      setMessage("PIN modifié");
      setPinForm({ ancien_pin: "", nouveau_pin: "" });
      setError("");
    },
    onError: () => setError("Ancien PIN incorrect"),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 rounded-lg bg-artek-green/20 text-artek-green text-sm">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="p-4 rounded-xl surface border">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Identifiant médecin</p>
        <p className="font-mono text-sm text-artek-green break-all">{profile?.id}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile.mutate();
          }}
          className="p-5 rounded-xl surface border space-y-3"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Informations professionnelles</h2>
          <input value={profile?.nom ?? ""} disabled className="input-disabled" />
          <input
            value={profile ? formatPhone(profile.telephone) : ""}
            disabled
            className="input-disabled"
          />
          <input
            value={form.specialite}
            onChange={(e) => setForm({ ...form, specialite: e.target.value })}
            placeholder="Spécialité"
            className="input-field"
          />
          <input
            value={form.prefecture}
            onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            placeholder="Préfecture"
            className="input-field"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              className="accent-artek-green"
            />
            Disponible pour consultations
          </label>
          <button type="submit" className="btn-primary" disabled={updateProfile.isPending}>
            Enregistrer
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePin.mutate();
          }}
          className="p-5 rounded-xl surface border space-y-3"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Sécurité — Changer le PIN</h2>
          <input
            type="password"
            value={pinForm.ancien_pin}
            onChange={(e) => setPinForm({ ...pinForm, ancien_pin: e.target.value })}
            placeholder="Ancien PIN"
            className="input-field"
          />
          <input
            type="password"
            value={pinForm.nouveau_pin}
            onChange={(e) => setPinForm({ ...pinForm, nouveau_pin: e.target.value })}
            placeholder="Nouveau PIN"
            className="input-field"
            minLength={4}
          />
          <button type="submit" className="btn-secondary" disabled={changePin.isPending}>
            Modifier le PIN
          </button>
        </form>
      </div>
    </div>
  );
}

function PatientsGestionTab() {
  const { data, isLoading } = usePatients();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", prenom: "", prefecture: "", village: "" });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof form }) =>
      api.patch(`/api/v1/patients/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/patients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });

  if (isLoading) return <LoadingState />;

  return (
    <GestionList
      title="Gestion des patients"
      empty="Aucun patient"
      items={data?.items ?? []}
      renderItem={(p) => (
        <div key={p.id} className="p-4 rounded-xl surface border">
          {editing === p.id ? (
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom"
                className="input-field"
              />
              <input
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom"
                className="input-field"
              />
              <input
                value={form.prefecture}
                onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
                placeholder="Préfecture"
                className="input-field"
              />
              <input
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                placeholder="Village"
                className="input-field"
              />
              <button
                onClick={() => update.mutate({ id: p.id, body: form })}
                className="btn-primary sm:col-span-2"
              >
                Sauvegarder
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {(p as { nom?: string; prenom?: string }).prenom}{" "}
                  {(p as { nom?: string }).nom} — {formatPhone(p.telephone)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {p.prefecture}
                  {p.village && ` · ${p.village}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditing(p.id);
                    setForm({
                      nom: (p as { nom?: string }).nom ?? "",
                      prenom: (p as { prenom?: string }).prenom ?? "",
                      prefecture: p.prefecture,
                      village: p.village ?? "",
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer ce patient ?")) remove.mutate(p.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
}

function ConsultationsGestionTab() {
  const { data, isLoading } = useConsultations();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ motif: "", statut: "en_attente", type_consultation: "video" });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof form }) =>
      api.patch(`/api/v1/consultations/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/consultations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultations"] }),
  });

  if (isLoading) return <LoadingState />;

  return (
    <GestionList
      title="Gestion des consultations"
      empty="Aucune consultation"
      items={data?.items ?? []}
      renderItem={(c) => (
        <div key={c.id} className="p-4 rounded-xl surface border">
          {editing === c.id ? (
            <div className="space-y-2">
              <input
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                placeholder="Motif"
                className="input-field"
              />
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className="input-field"
              >
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
              <select
                value={form.type_consultation}
                onChange={(e) => setForm({ ...form, type_consultation: e.target.value })}
                className="input-field"
              >
                <option value="video">Vidéo</option>
                <option value="audio">Audio</option>
                <option value="chat">Chat</option>
                <option value="differe">Différé</option>
              </select>
              <button onClick={() => update.mutate({ id: c.id, body: form })} className="btn-primary">
                Sauvegarder
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium capitalize">{c.type_consultation}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{c.motif ?? "Sans motif"}</p>
                <StatusBadge statut={c.statut} />
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditing(c.id);
                    setForm({
                      motif: c.motif ?? "",
                      statut: c.statut,
                      type_consultation: c.type_consultation,
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer cette consultation ?")) remove.mutate(c.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
}

function OrdonnancesGestionTab() {
  const { data, isLoading } = useOrdonnances();
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/ordonnances/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ordonnances"] }),
  });

  if (isLoading) return <LoadingState />;

  return (
    <GestionList
      title="Gestion des ordonnances"
      empty="Aucune ordonnance"
      items={data?.items ?? []}
      renderItem={(o) => (
        <div key={o.id} className="p-4 rounded-xl surface border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-artek-green">{o.qr_code}</p>
              <ul className="mt-2 space-y-1">
                {o.medicaments
                  .filter((m) => m.nom)
                  .map((m, i) => (
                    <li key={i} className="text-sm text-gray-500 dark:text-gray-400">
                      {m.nom} — {m.dosage}
                    </li>
                  ))}
              </ul>
            </div>
            <button
              onClick={() => {
                if (confirm("Supprimer cette ordonnance ?")) remove.mutate(o.id);
              }}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    />
  );
}

function GestionList<T extends { id: string }>({
  title,
  empty,
  items,
  renderItem,
}: {
  title: string;
  empty: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm p-6 rounded-xl surface border text-center">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">{items.map(renderItem)}</div>
      )}
    </div>
  );
}
