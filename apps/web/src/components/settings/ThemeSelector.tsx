import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "@/store/theme.store";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: "light", label: "Clair", icon: Sun, desc: "Thème lumineux pour la journée" },
  { value: "dark", label: "Sombre", icon: Moon, desc: "Thème sombre, moins fatigant" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-1">
        <Monitor className="w-5 h-5 text-artek-green" />
        <h2 className="font-semibold text-gray-900 dark:text-white">Apparence</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Choisissez le thème d'affichage de l'application
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition text-left",
              theme === opt.value
                ? "border-artek-green bg-artek-green/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
            )}
          >
            <opt.icon
              className={cn(
                "w-6 h-6",
                theme === opt.value ? "text-artek-green" : "text-gray-400"
              )}
            />
            <span className="font-medium text-gray-900 dark:text-white">{opt.label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
