import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({ label, value, icon: Icon, color = "text-artek-green" }: StatCardProps) {
  return (
    <div className="p-5 rounded-xl surface border">
      <div className="flex items-center justify-between mb-3">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

const STATUT_STYLES: Record<string, string> = {
  en_attente_validation: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  refusee: "bg-red-500/20 text-red-600 dark:text-red-400",
  programmee: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  en_attente: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  en_cours: "bg-artek-green/20 text-artek-green",
  terminee: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
  annulee: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export function StatusBadge({ statut }: { statut: string }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        STATUT_STYLES[statut] ?? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      )}
    >
      {statut.replace("_", " ")}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 rounded-xl surface border text-center">
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <p className="text-gray-500 dark:text-gray-400 animate-pulse">Chargement...</p>
    </div>
  );
}
