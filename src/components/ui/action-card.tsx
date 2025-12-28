import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "default" | "primary" | "hero" | "amber" | "purple" | "blue";
  badge?: string;
  image?: string;
  className?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  to,
  variant = "default",
  badge,
  image,
  className,
}: ActionCardProps) {
  // Hero variant - large card with image
  if (variant === "hero") {
    return (
      <Link
        to={to}
        className={cn(
          "block rounded-2xl border border-border overflow-hidden transition-all duration-300 group",
          "bg-card hover:border-primary/50",
          "animate-fade-in",
          className
        )}
      >
        <div className="flex">
          {/* Left green bar */}
          <div className="w-1.5 bg-primary shrink-0" />
          
          {/* Content */}
          <div className="flex-1 p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              {badge && (
                <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded mb-2">
                  {badge}
                </span>
              )}
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
              <Button 
                size="sm" 
                className="mt-3 gap-2"
              >
                Ver Cardápio
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Image */}
            {image && (
              <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Colored variants (amber, purple, blue)
  const coloredVariants = ["amber", "purple", "blue"] as const;
  if (coloredVariants.includes(variant as typeof coloredVariants[number])) {
    const colorClasses = {
      amber: {
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
      },
      purple: {
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-500",
      },
      blue: {
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
      },
    };

    const colors = colorClasses[variant as keyof typeof colorClasses];

    return (
      <Link
        to={to}
        className={cn(
          "block p-4 rounded-xl border border-border transition-all duration-300 group",
          "bg-card hover:bg-secondary hover:border-border/80",
          "animate-fade-in",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-full shrink-0",
              colors.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </Link>
    );
  }

  // Default and primary variants
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
