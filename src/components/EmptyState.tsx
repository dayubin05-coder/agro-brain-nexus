import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center animate-fade-up">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl" aria-hidden="true" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/15 flex items-center justify-center text-primary">
          {icon ?? <Inbox className="h-9 w-9" />}
        </div>
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-lg font-display font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2 shadow-glow">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
