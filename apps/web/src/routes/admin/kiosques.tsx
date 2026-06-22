import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/kiosques")({
  component: KiosquesPage,
});

function KiosquesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["kiosques"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/kiosques");
      return data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoring kiosques</h1>
      {isLoading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((k: { id: string; prefecture: string; village: string; batterie_pct: number; statut: string }) => (
            <div key={k.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <h3 className="font-medium">{k.id}</h3>
              <p className="text-sm text-gray-400">{k.prefecture} — {k.village}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-artek-green">{k.statut}</span>
                <span className="text-gray-400">Batterie {k.batterie_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
