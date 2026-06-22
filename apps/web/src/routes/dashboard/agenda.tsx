import { createFileRoute, Link } from "@tanstack/react-router";
import { Video, Play } from "lucide-react";
import {
  PageHeader,
  LoadingState,
  EmptyState,
  StatusBadge,
} from "@/components/ui/dashboard";
import { useConsultations } from "@/hooks/useDashboard";
import { formatDate, formatPhone } from "@/lib/utils";
import { usePatients } from "@/hooks/useDashboard";

export const Route = createFileRoute("/dashboard/agenda")({
  component: AgendaPage,
});

function AgendaPage() {
  const { data, isLoading } = useConsultations();
  const { data: patients } = usePatients();

  const patientMap = new Map(
    patients?.items?.map((p) => [p.id, p]) ?? []
  );

  if (isLoading) return <LoadingState />;

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Planning des consultations"
        action={
          <Link
            to="/dashboard/consultation/nouvelle"
            className="px-4 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white text-sm font-medium"
          >
            + Nouvelle consultation
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState message="Aucune consultation planifiée. Créez-en une nouvelle." />
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const patient = patientMap.get(c.patient_id);
            return (
              <div
                key={c.id}
                className="list-row hover:border-gray-300 dark:hover:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-artek-green/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-artek-green" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {patient ? formatPhone(patient.telephone) : "Patient"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {c.motif ?? "Consultation"} · {c.type_consultation}
                      {c.debut_le && ` · ${formatDate(c.debut_le)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge statut={c.statut} />
                  {c.statut !== "terminee" && c.statut !== "annulee" && (
                    <Link
                      to="/dashboard/consultation/$id"
                      params={{ id: c.id }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-artek-green/20 text-artek-green text-sm hover:bg-artek-green/30"
                    >
                      <Play className="w-3 h-3" />
                      Ouvrir
                    </Link>
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
