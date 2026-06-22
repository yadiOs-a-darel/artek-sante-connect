import { ExternalLink, Copy, Video, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useVideoCall } from "@/hooks/useVideoCall";

interface VideoCallProps {
  consultationId: string;
  audioOnly?: boolean;
}

export function VideoCall({ consultationId, audioOnly = false }: VideoCallProps) {
  const { data: session, isLoading, error, refetch, isFetching } = useVideoCall(consultationId);
  const [copied, setCopied] = useState(false);

  const meetUrl = session?.room_url;
  const isReady = session?.configured && !!meetUrl;

  const openMeet = () => {
    if (meetUrl) window.open(meetUrl, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    if (!meetUrl) return;
    await navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || isFetching) {
    return (
      <div className="call-stage flex flex-col items-center justify-center gap-3 h-full">
        <Loader2 className="w-8 h-8 text-artek-green animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Préparation de la salle Google Meet...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="call-stage flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">
            Impossible de préparer la visioconférence.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-artek-green text-white text-sm hover:bg-artek-green/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="call-stage flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-lg">
          <div className="w-16 h-16 rounded-full bg-artek-green/20 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-artek-green" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            Google Meet non configuré
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {session?.message ??
              "Ajoutez GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_MEET_DEV_URL dans le fichier .env."}
          </p>
          <div className="text-left text-xs text-gray-600 dark:text-gray-400 surface-muted border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 font-mono">
            <p>GOOGLE_SERVICE_ACCOUNT_JSON=&#123;...&#125;</p>
            <p>GOOGLE_CALENDAR_ID=primary</p>
            <p>GOOGLE_MEET_DEV_URL=https://meet.google.com/xxx-xxxx-xxx</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="call-stage flex flex-col items-center justify-center h-full p-8">
      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 shadow-sm">
        <svg viewBox="0 0 87.5 72" className="w-12 h-12" aria-hidden>
          <path fill="#00832d" d="M49.5 36l8.53 9.75L73.5 42.25V54h-24z" />
          <path fill="#0066da" d="M14 18h24v36H14V18z" />
          <path fill="#e94235" d="M49.5 18 73.5 30v12L49.5 54V18z" />
          <path fill="#2684fc" d="M73.5 18v36l-15.47-3.5L49.5 36l8.53-9.75L73.5 18z" />
          <path fill="#00ac47" d="M14 54V18l15.47 3.5L38 36l-8.53 9.75L14 54z" />
          <path fill="#ffba00" d="M38 36 49.5 18v36L38 36z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {audioOnly ? "Consultation audio" : "Consultation vidéo"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6 max-w-md">
        La visioconférence se déroule sur Google Meet. Cliquez pour rejoindre la salle
        {session?.room_name ? ` (${session.room_name})` : ""}.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={openMeet}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-artek-green hover:bg-artek-green/90 text-white font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Rejoindre Google Meet
        </button>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6 break-all max-w-md text-center">{meetUrl}</p>
    </div>
  );
}
