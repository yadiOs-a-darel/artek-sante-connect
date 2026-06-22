import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [telephone, setTelephone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = Route.useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/login/medecin", {
        telephone,
        pin,
      });
      setAuth(data.access_token, data.refresh_token, "medecin");
      navigate({ to: "/dashboard/accueil" });
    } catch {
      setError("Téléphone ou PIN incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl surface border">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Connexion médecin</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Numéro Orange (+236) et code PIN
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</label>
            <div className="flex">
              <span className="px-3 py-2 surface-muted border border-gray-300 dark:border-gray-700 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
                +236
              </span>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="77000000"
                className="flex-1 input-field rounded-l-none border-l-0"
                required
                pattern="7\d{7}"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Code PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input-field"
              required
              minLength={4}
              maxLength={32}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white font-medium disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="text-artek-green hover:underline">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
