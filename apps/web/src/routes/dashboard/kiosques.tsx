import { createFileRoute, Link } from "@tanstack/react-router";
import { Battery, MapPin, RefreshCw, Sun, Wifi, WifiOff } from "lucide-react";
import { PageHeader, LoadingState, EmptyState } from "@/components/ui/dashboard";
import { useKiosques } from "@/hooks/useKiosques";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/kiosques")({
  component: KiosquesDashboardPage,
});

function BatteryIndicator({ pct }: { pct: number }) {
  const color =
    pct > 50 ? "bg-artek-green" : pct > 20 ? "bg-artek-orange" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Battery className="w-3.5 h-3.5" />
          Batterie
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function KiosquesDashboardPage() {
  const { data: kiosques, isLoading, refetch, isFetching } = useKiosques();

  const actifs = kiosques?.filter((k) => k.statut === "actif").length ?? 0;
  const enLigne = kiosques?.filter((k) => k.connexion_ok).length ?? 0;

  if (isLoading) return <LoadingState />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Kiosques ASC"
        description="Points de santé communautaires alimentés à l'énergie solaire"
        action={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Actualiser
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-section flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-artek-orange/15 flex items-center justify-center">
            <Sun className="w-6 h-6 text-artek-orange" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kiosques?.length ?? 0}</p>
            <p className="text-sm text-gray-500">Kiosques enregistrés</p>
          </div>
        </div>
        <div className="card-section flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-artek-green/15 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-artek-green" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{enLigne}</p>
            <p className="text-sm text-gray-500">Connectés</p>
          </div>
        </div>
        <div className="card-section flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{actifs}</p>
            <p className="text-sm text-gray-500">Statut actif</p>
          </div>
        </div>
      </div>

      {!kiosques?.length ? (
        <EmptyState message="Aucun kiosque enregistré. Lancez le seed : python -m scripts.seed" />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {kiosques.map((k) => (
            <article
              key={k.id}
              className="card-section hover:border-artek-green/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-artek-orange/20 to-artek-green/20 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-artek-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{k.prefecture}</h3>
                    <p className="text-sm text-gray-500">{k.village ?? "—"}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                    k.statut === "actif"
                      ? "bg-artek-green/15 text-artek-green"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  )}
                >
                  {k.statut}
                </span>
              </div>

              <p className="text-xs font-mono text-gray-400 mb-4">{k.id}</p>

              <BatteryIndicator pct={k.batterie_pct} />

              <div className="mt-4 flex items-center gap-2 text-sm">
                {k.connexion_ok ? (
                  <>
                    <Wifi className="w-4 h-4 text-artek-green" />
                    <span className="text-artek-green font-medium">Connexion OK</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-medium">Hors ligne</span>
                  </>
                )}
              </div>

              {k.latitude != null && k.longitude != null ? (
                <p className="mt-3 text-xs text-gray-400">
                  GPS : {k.latitude.toFixed(4)}, {k.longitude.toFixed(4)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Les patients peuvent consulter ces kiosques depuis l&apos;app mobile —{" "}
        <Link to="/dashboard/accueil" className="text-artek-green hover:underline">
          tableau de bord
        </Link>
        .
      </p>
    </div>
  );
}
