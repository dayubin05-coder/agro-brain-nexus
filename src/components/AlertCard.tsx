import { AlertTriangle, Bug, CloudRain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "praga" | "clima" | "maquina" | "geral";

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
  time: string;
  severity: "alta" | "media" | "baixa";
}

const icons: Record<AlertType, React.ElementType> = {
  praga: Bug,
  clima: CloudRain,
  maquina: Wrench,
  geral: AlertTriangle,
};

export default function AlertCard({ type, title, description, time, severity }: AlertCardProps) {
  const Icon = icons[type];
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200",
        "hover:shadow-card hover:-translate-y-0.5",
        severity === "alta" && "border-destructive/30 bg-destructive/[0.04] hover:border-destructive/50",
        severity === "media" && "border-warning/30 bg-warning/[0.05] hover:border-warning/50",
        severity === "baixa" && "border-border bg-card hover:border-primary/30"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1",
          severity === "alta" && "bg-destructive/12 text-destructive ring-destructive/20",
          severity === "media" && "bg-warning/15 text-warning ring-warning/20",
          severity === "baixa" && "bg-muted text-muted-foreground ring-border"
        )}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>
      <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap tabular-nums">{time}</span>
    </div>
  );
}
