import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "default" | "primary" | "hero" | "amber" | "purple" | "blue" | "rose";
  badge?: string;
  image?: string;
  className?: string;
  disabled?: boolean;
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
  disabled = false,
}: ActionCardProps) {
  // Hero variant — deep emerald editorial card with gold accents
  if (variant === "hero") {
    return (
      <Link
        to={to}
        className={cn(
          "block rounded-2xl overflow-hidden transition-all duration-300 group relative",
          "bg-ed-hero hover:shadow-2xl border border-gold/40",
          "animate-fade-in",
          className
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="p-5 flex items-center gap-4 relative">
          <div className="p-3 rounded-full bg-gold/15 border border-gold/40 shrink-0">
            <Icon className="h-6 w-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            {badge && (
              <span className="inline-block editorial-label text-gold mb-1">
                {badge}
              </span>
            )}
            <h3 className="editorial-title text-2xl text-ed-hero-foreground">
              {title}
            </h3>
            <p className="text-sm text-ed-hero-foreground/70 mt-1 line-clamp-2 font-sans-editorial">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gold shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  }

  // Unified editorial-gold pattern for every non-hero variant
  const content = (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "p-3 rounded-full shrink-0 border transition-colors bg-cream-soft",
          disabled
            ? "border-emerald-deep/10"
            : "border-gold group-hover:bg-gold/10"
        )}
      >
        <Icon className={cn("h-5 w-5", disabled ? "text-emerald-deep/30" : "text-gold")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={cn(
            "editorial-title text-xl transition-colors",
            disabled ? "text-emerald-deep/40" : "text-emerald-deep"
          )}>
            {title}
          </h3>
          {badge && (
            <span className="editorial-label text-gold">
              {badge}
            </span>
          )}
        </div>
        <p className={cn(
          "text-sm mt-0.5 line-clamp-2 font-sans-editorial",
          disabled ? "text-emerald-deep/30" : "text-emerald-deep/60"
        )}>
          {description}
        </p>
      </div>
      <ChevronRight className={cn(
        "h-5 w-5 shrink-0 transition-all",
        disabled ? "text-emerald-deep/20" : "text-gold group-hover:translate-x-1"
      )} />
    </div>
  );

  const baseClasses = cn(
    "block p-4 rounded-xl border transition-all duration-300",
    "bg-cream-soft border-gold/40",
    "animate-fade-in",
    className
  );

  if (disabled) {
    return (
      <div className={cn(baseClasses, "opacity-60 cursor-not-allowed")}>
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(baseClasses, "group hover:border-gold hover:shadow-md")}
    >
      {content}
    </Link>
  );
}
