import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "accent";
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card rounded-xl p-5 relative overflow-hidden group",
        variant === "primary" && "glow-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn(
            "text-3xl font-bold font-display",
            variant === "primary" && "gradient-text",
            variant === "accent" && "text-accent",
            variant === "default" && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          variant === "primary" && "bg-primary/10",
          variant === "accent" && "bg-accent/10",
          variant === "default" && "bg-secondary"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === "primary" && "text-primary",
            variant === "accent" && "text-accent",
            variant === "default" && "text-muted-foreground"
          )} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
