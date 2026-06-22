import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Sun, Wifi } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-artek-green/10 dark:from-gray-950 dark:via-gray-900 dark:to-artek-green/10">
      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-artek-green flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">ARTEK Connect Santé</span>
        </div>
        <Link
          to="/login"
          className="px-5 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white font-medium transition"
        >
          Connexion médecin
        </Link>
      </header>

      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-artek-green to-artek-blue bg-clip-text text-transparent">
          Télémédecine solaire pour la RCA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
          Plateforme intégrée de santé numérique — consultations vidéo,
          dossiers médicaux, kiosques solaires et IA diagnostique.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Sun className="w-8 h-8 text-artek-orange" />}
            title="Kiosques solaires"
            description="Accès santé dans les zones rurales, alimentés à l'énergie solaire."
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-artek-green" />}
            title="Téléconsultation"
            description="Consultations vidéo avec médecins, même en connexion limitée."
          />
          <FeatureCard
            icon={<Wifi className="w-8 h-8 text-artek-blue" />}
            title="Mode hors-ligne"
            description="Synchronisation automatique dès le retour de la connexion."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl surface border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}
