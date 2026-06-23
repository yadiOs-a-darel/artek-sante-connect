import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { PatientEditForm } from "@/components/patient/PatientEditForm";
import { LoadingState } from "@/components/ui/dashboard";

export const Route = createFileRoute("/dashboard/patients/$id")({
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/patients/${id}`);
      return data;
    },
  });

  if (isLoading) return <LoadingState />;
  if (!patient) return <p className="text-gray-500 dark:text-gray-400">Patient introuvable.</p>;

  return (
    <div className="max-w-xl">
      <Link
        to="/dashboard/patients"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-artek-green mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux patients
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {patient.prenom} {patient.nom}
      </h1>

      <div className="p-5 rounded-xl surface border">
        <PatientEditForm
          patient={patient}
          onDeleted={() => navigate({ to: "/dashboard/patients" })}
        />
      </div>
    </div>
  );
}
