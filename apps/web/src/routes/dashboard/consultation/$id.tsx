import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/hooks/useConsultation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VideoCall } from "@/components/consultation/VideoCall";
import { ChatConsultation } from "@/components/consultation/ChatConsultation";
import { OrdonnanceForm } from "@/components/ordonnance/OrdonnanceForm";
import { PatientCard } from "@/components/patient/PatientCard";
import { ConstantesVitales } from "@/components/patient/ConstantesVitales";

export const Route = createFileRoute("/dashboard/consultation/$id")({
  component: ConsultationPage,
});

const MODE_LABELS = {
  video: "Vidéo",
  audio: "Audio",
  chat: "Chat",
} as const;

function ConsultationPage() {
  const { id } = Route.useParams();
  const { consultation, patient, isLoading } = useConsultation(id);
  const { constantes } = useWebSocket(id);
  const [mode, setMode] = useState<"video" | "audio" | "chat">("video");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 dark:text-gray-400">Chargement de la consultation...</p>
      </div>
    );
  }

  return (
    <div className="consultation-layout">
      <div className="consultation-grid">
        <section className="consultation-main">
          <div className="flex-1 min-h-0">
            <div className="h-full rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
            {mode === "video" && (
              <VideoCall consultationId={id} fallbackMeetUrl={consultation?.salle_video_url} />
            )}
            {mode === "audio" && (
              <VideoCall consultationId={id} audioOnly fallbackMeetUrl={consultation?.salle_video_url} />
            )}
            {mode === "chat" && (
              <ChatConsultation
                consultationId={id}
                patientLabel={
                  patient
                    ? `Patient ${patient.telephone?.slice(-4) ?? ""}`
                    : "le patient"
                }
              />
            )}
            </div>
          </div>

          <div className="consultation-tabs">
            {(["video", "audio", "chat"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-medium transition",
                  mode === m
                    ? "bg-artek-green text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </section>

        <aside className="consultation-aside">
          {patient && <PatientCard patient={patient} compact />}
          <ConstantesVitales constantes={constantes} compact />
          {consultation && (
            <div className="card-section py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Statut
              </p>
              <p className="text-base font-medium text-artek-green capitalize mt-1">
                {consultation.statut.replace("_", " ")}
              </p>
            </div>
          )}
          {patient &&
            consultation &&
            ["en_cours", "terminee", "programmee"].includes(consultation.statut) && (
              <div className="card-section py-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Rédiger une ordonnance
                </p>
                <OrdonnanceForm
                  key={`${patient.id}-${id}`}
                  compact
                  showPatientSelect={false}
                  defaults={{
                    patient_id: patient.id,
                    consultation_id: id,
                  }}
                  submitLabel="Prescrire et générer le QR"
                />
              </div>
            )}
        </aside>
      </div>
    </div>
  );
}
