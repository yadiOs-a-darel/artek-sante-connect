import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PatientCard } from "@/components/patient/PatientCard";

export const Route = createFileRoute("/dashboard/patients/$id")({
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { id } = Route.useParams();
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/patients/${id}`);
      return data;
    },
  });

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Chargement...</p>;
  if (!patient) return <p className="text-gray-500 dark:text-gray-400">Patient introuvable.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Fiche patient</h1>
      <PatientCard patient={patient} />
    </div>
  );
}
