interface ConstantesVitalesProps {
  constantes: Record<string, unknown>;
  compact?: boolean;
}

export function ConstantesVitales({ constantes, compact }: ConstantesVitalesProps) {
  const hasData = Object.keys(constantes).length > 0;

  return (
    <div className={`rounded-xl surface-muted border border-gray-200 dark:border-gray-700 ${compact ? "p-3" : "p-5"}`}>
      <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? "text-sm" : "text-lg"}`}>
        Constantes vitales
      </h3>
      {!hasData ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">En attente des mesures IoT...</p>
      ) : (
        <dl className="mt-2 space-y-1 text-sm">
          {Object.entries(constantes).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400 capitalize">{key}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
