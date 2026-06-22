import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/hooks/useConsultation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VideoCall } from "@/components/consultation/VideoCall";
import { PatientCard } from "@/components/patient/PatientCard";
import { ConstantesVitales } from "@/components/patient/ConstantesVitales";

export const Route = createFileRoute("/dashboard/consultation/$id")({
  component: ConsultationPage,
});

function ConsultationPage() {
  const { id } = Route.useParams();
  const { consultation, patient, isLoading } = useConsultation(id);
  const { constantes } = useWebSocket(id);
  const [mode, setMode] = useState<"video" | "audio" | "chat">("video");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Chargement de la consultation...</p>
      </div>
    );
  }

  return (
    <div className="consultation-shell">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative min-h-0">
          {mode === "video" && <VideoCall consultationId={id} />}
          {mode === "audio" && <VideoCall consultationId={id} audioOnly />}
          {mode === "chat" && (
            <div className="call-stage flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Mode chat texte — bientôt disponible</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-3 consultation-panel border-t shrink-0">
          {(["video", "audio", "chat"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm capitalize transition",
                mode === m
                  ? "bg-artek-green text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <aside className="w-80 consultation-panel border-l overflow-y-auto p-4 space-y-4 shrink-0">
        {patient && <PatientCard patient={patient} compact />}
        <ConstantesVitales constantes={constantes} compact />
        {consultation && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Statut : <span className="text-artek-green font-medium">{consultation.statut}</span>
          </div>
        )}
      </aside>
    </div>
  );
}
