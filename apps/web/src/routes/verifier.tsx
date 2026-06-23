import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { CheckCircle, XCircle, Search } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type VerifyResult = {
  valide: boolean;
  qr_code: string;
  medecin_nom?: string;
  patient_initiales?: string;
  medicaments: Array<{ nom: string; dosage: string; frequence: string; duree: string }>;
  instructions?: string;
  message?: string;
};

export const Route = createFileRoute("/verifier")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : "",
  }),
  component: VerifierOrdonnancePage,
});

function VerifierOrdonnancePage() {
  const { code: initialCode } = useSearch({ from: "/verifier" });
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async (qrCode: string) => {
    const trimmed = qrCode.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get<VerifyResult>(
        `${API_URL}/api/v1/ordonnances/verify/${encodeURIComponent(trimmed)}`
      );
      setResult(data);
    } catch {
      setError("Impossible de contacter le serveur de vérification.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      void verify(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-artek-green/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-artek-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Vérification ordonnance
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Espace pharmacie ARTEK</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify(code);
          }}
          className="flex gap-2 mb-6"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ARTEK-XXXXXXXX"
            className="input-field flex-1 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-artek-green text-white font-medium disabled:opacity-50"
          >
            Vérifier
          </button>
        </form>

        {error ? <p className="text-sm text-red-500 mb-4">{error}</p> : null}

        {result && (
          <div
            className={`rounded-xl border p-4 ${
              result.valide
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.valide ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.valide ? "Ordonnance valide" : "Ordonnance invalide"}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{result.message}</p>
            {result.valide && (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Code :</span>{" "}
                  <code className="text-artek-green">{result.qr_code}</code>
                </p>
                {result.medecin_nom && (
                  <p>
                    <span className="text-gray-500">Médecin :</span> {result.medecin_nom}
                  </p>
                )}
                {result.patient_initiales && (
                  <p>
                    <span className="text-gray-500">Patient :</span> {result.patient_initiales}
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {result.medicaments.map((m, i) => (
                    <li
                      key={i}
                      className="p-2 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                    >
                      <strong>{m.nom}</strong> — {m.dosage}, {m.frequence}, {m.duree}
                    </li>
                  ))}
                </ul>
                {result.instructions && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Instructions :</span> {result.instructions}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
