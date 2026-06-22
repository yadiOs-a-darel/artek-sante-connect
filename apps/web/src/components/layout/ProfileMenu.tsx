import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Palette, Settings, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMedecinProfile } from "@/hooks/useDashboard";
import { formatPhone } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: profile } = useMedecinProfile();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const initials = profile?.nom
    ? profile.nom
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MD";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg transition",
          open ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-artek-green/20 flex items-center justify-center text-artek-green text-xs font-bold">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium leading-tight truncate max-w-[120px] text-gray-900 dark:text-white">
            {profile?.nom ?? "Médecin"}
          </p>
          <p className="text-xs text-gray-500">
            {profile ? formatPhone(profile.telephone) : ""}
          </p>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-gray-400 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <p className="font-medium text-gray-900 dark:text-white">{profile?.nom ?? "Médecin"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile ? formatPhone(profile.telephone) : ""}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono break-all">
              ID : {profile?.id ?? "—"}
            </p>
            <p className="text-xs text-gray-500">{profile?.specialite}</p>
          </div>
          <div className="p-1">
            <Link
              to="/dashboard/parametres"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <User className="w-4 h-4 text-artek-green" />
              Éditer mon profil
            </Link>
            <Link
              to="/dashboard/parametres"
              search={{ tab: "apparence" }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Palette className="w-4 h-4 text-artek-green" />
              Apparence & thème
            </Link>
            <Link
              to="/dashboard/parametres"
              search={{ tab: "patients" }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Gestion des données
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
