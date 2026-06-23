import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Settings,
  Sun,
  Users,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

const navItems = [
  { to: "/dashboard/accueil", label: "Accueil", icon: Home },
  { to: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { to: "/dashboard/patients", label: "Patients", icon: Users },
  { to: "/dashboard/consultation/nouvelle", label: "Consultation", icon: Video },
  { to: "/dashboard/ordonnances", label: "Ordonnances", icon: FileText },
  { to: "/dashboard/rapports", label: "Rapports", icon: Heart },
  { to: "/dashboard/kiosques", label: "Kiosques", icon: Sun },
  {
    to: "/dashboard/parametres",
    label: "Paramètres",
    icon: Settings,
    search: { tab: "profil" as const },
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed, onNavigate }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <div
        className={cn(
          "p-5 border-b border-gray-200 dark:border-gray-800 flex items-center",
          collapsed ? "justify-center px-3" : "gap-2"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-artek-green flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm text-gray-900 dark:text-white">ARTEK Santé</span>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              {...("search" in item && item.search ? { search: item.search } : {})}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                collapsed && "justify-center px-2",
                active
                  ? "bg-artek-green/20 text-artek-green"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    closeMobileSidebar,
    setSidebarCollapsed,
  } = useUiStore();

  return (
    <>
      {/* Overlay mobile / tablette */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 lg:hidden",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent onNavigate={closeMobileSidebar} />
      </aside>

      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shrink-0",
          sidebarCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="m-3 p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center"
          title={sidebarCollapsed ? "Étendre" : "Réduire"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}

export { useUiStore };
