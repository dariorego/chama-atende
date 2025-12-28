import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "default" | "primary";
  className?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  to,
  variant = "default",
  className,
}: ActionCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "block p-4 rounded-xl border transition-all duration-300 group",
        variant === "primary"
          ? "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
          : "bg-card border-border hover:bg-secondary hover:border-border/80",
        "animate-fade-in",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg shrink-0",
            variant === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
