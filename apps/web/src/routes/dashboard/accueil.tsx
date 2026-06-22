import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Video, Activity, FileText } from "lucide-react";
import { PageHeader, StatCard, LoadingState, StatusBadge } from "@/components/ui/dashboard";
import { useDashboardStats, useConsultations } from "@/hooks/useDashboard";
import { formatDate } from "@/lib/utils";

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
      icon: Activity,
      color: "text-purple-400",
    },
  ];

  const recentes = consultations?.items?.slice(0, 5) ?? [];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité médicale"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
