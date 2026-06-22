import { Menu } from "lucide-react";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { useUiStore } from "@/store/ui.store";

export function Navbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Espace médecin</span>
      </div>
      <ProfileMenu />
    </header>
  );
}
