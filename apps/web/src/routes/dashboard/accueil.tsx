import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Video, Activity, FileText, Sun } from "lucide-react";
import { PageHeader, StatCard, LoadingState, StatusBadge } from "@/components/ui/dashboard";
import { useDashboardStats, useConsultations } from "@/hooks/useDashboard";
import { formatDate, formatPhone } from "@/lib/utils";
import { DemandeActions } from "@/components/consultation/DemandeActions";

export const Route = createFileRoute("/dashboard/accueil")({
  component: AccueilPage,
});

function AccueilPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: consultations } = useConsultations();

  if (isLoading) return <LoadingState />;

  const cards = [
    {
      label: "Consultations aujourd'hui",
      value: stats?.consultations_aujourdhui ?? 0,
      icon: Video,
      color: "text-artek-green",
    },
    {
      label: "Patients actifs",
      value: stats?.patients_actifs ?? 0,
      icon: Users,
      color: "text-artek-blue",
    },
    {
      label: "En attente",
      value: stats?.rendez_vous_en_attente ?? 0,
      icon: Calendar,
      color: "text-artek-orange",
    },
    {
      label: "Kiosques actifs",
      value: stats?.kiosques_actifs ?? 0,
      icon: Sun,
      color: "text-artek-orange",
      link: "/dashboard/kiosques" as const,
    },
  ];

  const recentes = consultations?.items?.slice(0, 5) ?? [];
  const demandes =
    consultations?.items?.filter((c) => c.statut === "en_attente_validation") ?? [];

  return (
    <div className="page-stack">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité médicale"
      />

      {demandes.length > 0 && (
        <section className="card-section border-artek-orange/30 bg-artek-orange/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Demandes à valider ({demandes.length})
            </h2>
            <Link to="/dashboard/agenda" className="text-sm text-artek-green hover:underline">
              Voir l&apos;agenda
            </Link>
          </div>
          <div className="space-y-3">
            {demandes.slice(0, 3).map((c) => {
              const fromKiosque =
                c.symptomes?.includes("[Kiosque]") || c.motif?.includes("[Kiosque]");
              return (
              <div key={c.id} className="p-3 rounded-lg surface border">
                {fromKiosque && (
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-artek-orange/15 text-artek-orange mb-2">
                    Kiosque ASC
                  </span>
                )}
                <p className="font-medium text-gray-900 dark:text-white">
                  {c.patient_telephone ? formatPhone(c.patient_telephone) : "Patient"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {c.symptomes || c.motif}
                </p>
                <DemandeActions consultationId={c.id} />
              </div>
            );
            })}
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {cards.map((stat) =>
          "link" in stat && stat.link ? (
            <Link key={stat.label} to={stat.link} className="block hover:opacity-90 transition">
              <StatCard {...stat} />
            </Link>
          ) : (
            <StatCard key={stat.label} {...stat} />
          )
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <div className="card-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consultations récentes</h2>
            <Link
              to="/dashboard/agenda"
              className="text-sm text-artek-green hover:underline"
            >
              Voir tout
            </Link>
          </div>
          {recentes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune consultation pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {recentes.map((c) => (
                <li key={c.id} className="list-item flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">{c.type_consultation}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.motif ?? "Sans motif"}
                      {c.debut_le && ` · ${formatDate(c.debut_le)}`}
                    </p>
                  </div>
                  <StatusBadge statut={c.statut} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-section">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/dashboard/consultation/nouvelle"
              className="p-4 rounded-lg bg-artek-green/10 border border-artek-green/30 hover:bg-artek-green/20 transition text-center"
            >
              <Video className="w-6 h-6 mx-auto mb-2 text-artek-green" />
              <span className="text-sm">Nouvelle consultation</span>
            </Link>
            <Link
              to="/dashboard/patients"
              className="p-4 rounded-lg bg-artek-blue/10 border border-artek-blue/30 hover:bg-artek-blue/20 transition text-center"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-artek-blue" />
              <span className="text-sm">Voir patients</span>
            </Link>
            <Link
              to="/dashboard/ordonnances"
              className="action-tile"
            >
              <FileText className="w-6 h-6 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">Ordonnances</span>
            </Link>
            <Link
              to="/dashboard/rapports"
              className="action-tile"
            >
              <Activity className="w-6 h-6 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">Rapports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
