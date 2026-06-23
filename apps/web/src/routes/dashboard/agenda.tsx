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
import { DemandeActions } from "@/components/consultation/DemandeActions";

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
  const demandes = items.filter((c) => c.statut === "en_attente_validation");
  const autres = items.filter((c) => c.statut !== "en_attente_validation");

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Demandes patients et consultations"
        action={
          <Link
            to="/dashboard/consultation/nouvelle"
            className="px-4 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white text-sm font-medium"
          >
            + Nouvelle consultation
          </Link>
        }
      />

      {demandes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Demandes à valider ({demandes.length})
          </h2>
          <div className="space-y-3">
            {demandes.map((c) => {
              const patient = patientMap.get(c.patient_id);
              const tel = c.patient_telephone ?? patient?.telephone;
              const fromKiosque =
                c.symptomes?.includes("[Kiosque]") || c.motif?.includes("[Kiosque]");
              return (
                <div key={c.id} className="p-4 rounded-xl surface border">
                  {fromKiosque && (
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-artek-orange/15 text-artek-orange mb-2">
                      Kiosque ASC
                    </span>
                  )}
                  <p className="font-medium text-gray-900 dark:text-white">
                    {tel ? formatPhone(tel) : "Patient"}
                  </p>
                  {(c.patient_nom || c.patient_prenom) && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {[c.patient_prenom, c.patient_nom].filter(Boolean).join(" ")}
                    </p>
                  )}
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

      {autres.length === 0 && demandes.length === 0 ? (
        <EmptyState message="Aucune consultation planifiée." />
      ) : autres.length > 0 ? (
        <div className="space-y-3">
          {autres.map((c) => {
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
      ) : null}
    </div>
  );
}
