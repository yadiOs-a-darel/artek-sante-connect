import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useConsultation(id: string) {
  const { data: consultation, isLoading: loadingConsultation } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/consultations/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", consultation?.patient_id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/patients/${consultation.patient_id}`);
      return data;
    },
    enabled: !!consultation?.patient_id,
  });

  return {
    consultation,
    patient,
    isLoading: loadingConsultation || loadingPatient,
  };
}
