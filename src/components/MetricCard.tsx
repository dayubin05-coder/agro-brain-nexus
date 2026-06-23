import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  delay = 0,
  className,
}: MetricCardProps) {
  const TrendIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 border border-border/60 bg-card",
        "shadow-card hover:shadow-card-hover hover:border-primary/30",
        "transition-all duration-300 ease-out hover:-translate-y-0.5",
        className
      )}
    >
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />
      {/* Top accent bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </p>
          <p className="text-3xl font-display font-bold text-foreground mt-2 tabular-nums tracking-tight">
            {value}
          </p>
          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-3 text-xs font-medium px-2 py-1 rounded-full",
                changeType === "positive" && "bg-success/10 text-success",
                changeType === "negative" && "bg-destructive/10 text-destructive",
                changeType === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              <TrendIcon className="w-3 h-3" aria-hidden="true" />
              <span className="truncate">{change}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-primary/15 to-primary/5 text-primary",
            "ring-1 ring-primary/15 shadow-xs",
            "group-hover:from-primary group-hover:to-primary-glow group-hover:text-primary-foreground",
            "group-hover:ring-primary/30 group-hover:shadow-glow",
            "transition-all duration-300"
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
}
