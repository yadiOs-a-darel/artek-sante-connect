import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConsultationChat } from "@/hooks/useConsultationChat";

interface ChatConsultationProps {
  consultationId: string;
  patientLabel?: string;
}

export function ChatConsultation({
  consultationId,
  patientLabel = "Patient",
}: ChatConsultationProps) {
  const { messages, isLoading, sendMessage, isSending } =
    useConsultationChat(consultationId);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || isSending) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="call-stage flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 consultation-panel shrink-0">
        <div className="w-9 h-9 rounded-full bg-artek-green/20 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-artek-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Chat consultation
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Échange avec {patientLabel}
          </p>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-artek-green animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun message pour l&apos;instant.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Envoyez le premier message au patient.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isDoctor = msg.sender_role === "medecin";
            return (
              <div
                key={msg.id}
                className={cn("flex", isDoctor ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                    isDoctor
                      ? "bg-artek-green text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium mb-1",
                      isDoctor ? "text-white/80" : "text-artek-green"
                    )}
                  >
                    {msg.sender_name}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.contenu}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 text-right",
                      isDoctor ? "text-white/70" : "text-gray-400"
                    )}
                  >
                    {format(new Date(msg.envoye_le), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 dark:border-gray-800 consultation-panel shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrivez votre message..."
            className="input-field flex-1"
            maxLength={4000}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="px-4 py-2 rounded-lg bg-artek-green hover:bg-artek-green/90 text-white disabled:opacity-50 transition flex items-center gap-2 shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-sm font-medium">Envoyer</span>
          </button>
        </div>
      </form>
    </div>
  );
}
