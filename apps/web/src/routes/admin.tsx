import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administration</h1>
      <p className="text-gray-400">Espace administrateur national.</p>
    </div>
  ),
});
