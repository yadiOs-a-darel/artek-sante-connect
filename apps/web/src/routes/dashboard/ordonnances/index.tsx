import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Plus, QrCode } from "lucide-react";
import {
  PageHeader,
  LoadingState,
  EmptyState,
} from "@/components/ui/dashboard";
import { useOrdonnances, usePatients } from "@/hooks/useDashboard";
import {
  OrdonnanceForm,
  downloadOrdonnancePdf,
  loadOrdonnanceQrUrl,
} from "@/components/ordonnance/OrdonnanceForm";
import { formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/ordonnances/")({
  component: OrdonnancesPage,
});

function OrdonnanceQrPreview({ ordonnanceId }: { ordonnanceId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    loadOrdonnanceQrUrl(ordonnanceId).then((url) => {
      if (active) {
        objectUrl = url;
        setSrc(url);
      }
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ordonnanceId]);
  if (!src) return <QrCode className="w-16 h-16 text-artek-green opacity-40" />;
  return <img src={src} alt="QR ordonnance" className="w-16 h-16 rounded-lg border" />;
}

export default function OrdonnancesPage() {
  const { data, isLoading } = useOrdonnances();
  const { data: patients } = usePatients();
  const [showForm, setShowForm] = useState(false);

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
        <OrdonnanceForm
          patients={patients?.items}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {data?.items?.length === 0 ? (
        <EmptyState message="Aucune ordonnance. Créez-en une pour un patient." />
      ) : (
        <div className="space-y-3">
          {data?.items?.map((o) => {
            const patient = patients?.items?.find((p) => p.id === o.patient_id);
            const meds = o.medicaments.filter((m) => m.nom);
            const instructions = o.medicaments.find((m) => m.instructions)?.instructions;
            return (
              <div key={o.id} className="list-row">
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="flex-1">
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
                    {instructions && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Instructions : {instructions}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {o.qr_code && (
                        <code className="text-xs text-artek-green bg-artek-green/10 px-2 py-1 rounded">
                          {o.qr_code}
                        </code>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          downloadOrdonnancePdf(o.id, `ordonnance-${o.qr_code}.pdf`)
                        }
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </div>
                  </div>
                  {o.qr_code && <OrdonnanceQrPreview ordonnanceId={o.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
