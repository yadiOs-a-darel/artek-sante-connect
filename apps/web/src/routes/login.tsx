import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MEDECIN_SPECIALITES, RCA_PREFECTURES } from "@/constants/rca";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "login" | "register";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [telephone, setTelephone] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [nom, setNom] = useState("");
  const [specialite, setSpecialite] = useState<string>(MEDECIN_SPECIALITES[0]);
  const [prefecture, setPrefecture] = useState<string>(RCA_PREFECTURES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = Route.useNavigate();

  const resetErrors = () => setError("");

  const switchMode = (next: Mode) => {
    setMode(next);
    resetErrors();
  };

  const handleLogin = async (e: React.FormEvent) => {
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
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError(
          "Impossible de joindre l'API. Vérifiez que le backend tourne et que VITE_API_URL est correct (localhost:8000 sur ce PC)."
        );
      } else {
        const detail = axios.isAxiosError(err)
          ? String(err.response?.data?.detail ?? "Téléphone ou PIN incorrect")
          : "Téléphone ou PIN incorrect";
        setError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin !== pinConfirm) {
      setError("Les codes PIN ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/register/medecin", {
        nom,
        telephone,
        pin,
        pin_confirm: pinConfirm,
        specialite,
        prefecture,
      });
      setAuth(data.access_token, data.refresh_token, "medecin");
      navigate({ to: "/dashboard/accueil" });
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? String(err.response?.data?.detail ?? "Inscription impossible. Vérifiez vos informations.")
        : "Inscription impossible. Vérifiez vos informations.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-2xl surface border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-artek-green flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ARTEK Connect Santé
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Espace médecin</p>
          </div>
        </div>

        <div className="flex p-1 rounded-lg surface-muted mb-6">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchMode(tab)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition",
                mode === tab
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {tab === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {mode === "login" ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Numéro Orange (+236) et code PIN
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <PhoneField telephone={telephone} onChange={setTelephone} />
              <PinField label="Code PIN" value={pin} onChange={setPin} />
              {error && <ErrorText message={error} />}
              <SubmitButton loading={loading} label="Se connecter" loadingLabel="Connexion..." />
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Créez votre compte médecin ARTEK
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Dr. Jean Koyamba"
                  className="input-field"
                  required
                  minLength={2}
                />
              </div>
              <PhoneField telephone={telephone} onChange={setTelephone} />
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Spécialité
                </label>
                <select
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="input-field"
                  required
                >
                  {MEDECIN_SPECIALITES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Préfecture
                </label>
                <select
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                  className="input-field"
                  required
                >
                  {RCA_PREFECTURES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <PinField label="Code PIN" value={pin} onChange={setPin} />
              <PinField
                label="Confirmer le PIN"
                value={pinConfirm}
                onChange={setPinConfirm}
              />
              {error && <ErrorText message={error} />}
              <SubmitButton
                loading={loading}
                label="Créer mon compte"
                loadingLabel="Inscription..."
              />
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="text-artek-green hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

function PhoneField({
  telephone,
  onChange,
}: {
  telephone: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</label>
      <div className="flex">
        <span className="px-3 py-2 surface-muted border border-gray-300 dark:border-gray-700 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
          +236
        </span>
        <input
          type="tel"
          value={telephone}
          onChange={(e) => onChange(e.target.value)}
          placeholder="72000001"
          className="flex-1 input-field rounded-l-none border-l-0"
          required
          pattern="7[234]\d{6}"
        />
      </div>
    </div>
  );
}

function PinField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        required
        minLength={4}
        maxLength={32}
      />
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p className="text-red-500 dark:text-red-400 text-sm">{message}</p>;
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white font-medium disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
