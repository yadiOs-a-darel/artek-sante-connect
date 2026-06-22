import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader, StatCard, LoadingState } from "@/components/ui/dashboard";
import { useRapportEpidemio } from "@/hooks/useDashboard";
import { useChartTheme } from "@/hooks/useChartTheme";
import { Users, Activity, AlertTriangle, Heart } from "lucide-react";

const COLORS = ["#00A651", "#0066B3", "#F7941D", "#9333ea"];

export const Route = createFileRoute("/dashboard/rapports")({
  component: RapportsPage,
});

function RapportsPage() {
  const { data, isLoading } = useRapportEpidemio();
  const chart = useChartTheme();

  if (isLoading) return <LoadingState />;

  const maladies = [
    { name: "Paludisme", value: data?.cas_malaria ?? 0 },
    { name: "Malnutrition", value: data?.cas_malnutrition ?? 0 },
  ];

  const consultations = [
    { name: "Terminées", value: data?.consultations_terminees ?? 0 },
    { name: "En cours", value: data?.consultations_en_cours ?? 0 },
    { name: "En attente", value: data?.consultations_en_attente ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Rapports épidémiologiques"
        description={`Période : ${data?.periode ?? "—"}`}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Patients total"
          value={data?.total_patients ?? 0}
          icon={Users}
          color="text-artek-blue"
        />
        <StatCard
          label="Consultations terminées"
          value={data?.consultations_terminees ?? 0}
          icon={Activity}
          color="text-artek-green"
        />
        <StatCard
          label="Cas paludisme"
          value={data?.cas_malaria ?? 0}
          icon={AlertTriangle}
          color="text-artek-orange"
        />
        <StatCard
          label="Malnutrition"
          value={data?.cas_malnutrition ?? 0}
          icon={Heart}
          color="text-red-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-section">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Consultations par statut</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consultations}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="name" stroke={chart.axis} fontSize={12} />
              <YAxis stroke={chart.axis} fontSize={12} />
              <Tooltip contentStyle={chart.tooltip} />
              <Bar dataKey="value" fill="#00A651" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-section">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Maladies signalées</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={maladies}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {maladies.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chart.tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 card-section">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Consultations par préfecture</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-2">Préfecture</th>
                  <th className="text-right py-2">Consultations</th>
                </tr>
              </thead>
              <tbody>
                {data?.prefectures?.map((p) => (
                  <tr key={p.nom} className="border-b border-gray-200 dark:border-gray-800/50">
                    <td className="py-3 text-gray-900 dark:text-gray-100">{p.nom}</td>
                    <td className="text-right text-artek-green font-medium">
                      {p.consultations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
