import { formatPhone } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  telephone: string;
  prefecture: string;
  village?: string;
}

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientCard({ patient, compact }: PatientCardProps) {
  return (
    <div className={cn("rounded-xl surface-muted border border-gray-200 dark:border-gray-700", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-gray-900 dark:text-white", compact ? "text-sm" : "text-lg")}>
        Patient
      </h3>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Téléphone</dt>
          <dd className="text-gray-900 dark:text-gray-100">{formatPhone(patient.telephone)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Préfecture</dt>
          <dd className="text-gray-900 dark:text-gray-100">{patient.prefecture}</dd>
        </div>
        {patient.village && (
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Village</dt>
            <dd className="text-gray-900 dark:text-gray-100">{patient.village}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
