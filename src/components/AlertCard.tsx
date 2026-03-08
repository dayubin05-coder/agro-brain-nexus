import { AlertTriangle, Bug, CloudRain, Wrench } from "lucide-react";

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
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      severity === "alta" ? "border-destructive/30 bg-destructive/5" :
      severity === "media" ? "border-warning/30 bg-warning/5" :
      "border-border bg-card"
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        severity === "alta" ? "bg-destructive/10" :
        severity === "media" ? "bg-warning/10" :
        "bg-muted"
      }`}>
        <Icon className={`w-4 h-4 ${
          severity === "alta" ? "text-destructive" :
          severity === "media" ? "text-warning" :
          "text-muted-foreground"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}
