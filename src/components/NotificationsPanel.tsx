import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Package, Wrench, Bug, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/use-current-user";

interface Notification {
  id: string;
  type: "estoque" | "maquina" | "praga";
  title: string;
  description: string;
  severity: "alta" | "media" | "baixa";
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { data: user } = useCurrentUser();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const alerts: Notification[] = [];

      // Low stock alerts
      const { data: estoque } = await supabase
        .from("estoque")
        .select("id, nome, quantidade, quantidade_minima, fazenda_id")
        .not("quantidade_minima", "is", null);
      estoque?.forEach((item) => {
        if (item.quantidade_minima && item.quantidade <= item.quantidade_minima) {
          alerts.push({
            id: `est-${item.id}`,
            type: "estoque",
            title: `Estoque baixo: ${item.nome}`,
            description: `Quantidade: ${item.quantidade} (mín: ${item.quantidade_minima})`,
            severity: item.quantidade <= item.quantidade_minima * 0.5 ? "alta" : "media",
          });
        }
      });

      // Machine maintenance alerts
      const { data: maquinas } = await supabase
        .from("maquinas")
        .select("id, nome, proxima_manutencao, status");
      maquinas?.forEach((m) => {
        if (m.proxima_manutencao) {
          const mDate = new Date(m.proxima_manutencao);
          const now = new Date();
          const diffDays = Math.ceil((mDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            alerts.push({
              id: `maq-${m.id}`,
              type: "maquina",
              title: `Manutenção: ${m.nome}`,
              description: diffDays <= 0 ? "Manutenção atrasada!" : `Em ${diffDays} dia(s)`,
              severity: diffDays <= 0 ? "alta" : "media",
            });
          }
        }
        if (m.status === "manutencao") {
          alerts.push({
            id: `maq-st-${m.id}`,
            type: "maquina",
            title: `${m.nome} em manutenção`,
            description: "Equipamento parado para reparo",
            severity: "media",
          });
        }
      });

      // Active pest alerts
      const { data: pragas } = await supabase
        .from("pragas_ocorrencias")
        .select("id, nome, severidade, status")
        .eq("status", "ativa");
      pragas?.forEach((p) => {
        alerts.push({
          id: `prg-${p.id}`,
          type: "praga",
          title: `Praga ativa: ${p.nome}`,
          description: `Severidade: ${p.severidade}`,
          severity: p.severidade === "alta" || p.severidade === "critica" ? "alta" : "media",
        });
      });

      return alerts;
    },
    refetchInterval: 60000,
  });

  const iconMap = { estoque: Package, maquina: Wrench, praga: Bug };
  const sevColor = {
    alta: "bg-destructive/10 text-destructive border-destructive/20",
    media: "bg-warning/10 text-warning border-warning/20",
    baixa: "bg-info/10 text-info border-info/20",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-card rounded-xl border border-border shadow-xl z-50 max-h-[70vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="font-display font-semibold text-foreground text-sm">Notificações</h3>
                {notifications.length > 0 && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma notificação no momento 🎉
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border ${sevColor[n.severity]}`}>
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <p className="text-xs opacity-70 mt-0.5">{n.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
