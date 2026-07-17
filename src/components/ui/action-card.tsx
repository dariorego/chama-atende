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
          "bg-[#064e3b] hover:shadow-2xl border border-[#c9a84c]/40",
          "animate-fade-in",
          className
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="p-5 flex items-center gap-4 relative">
          <div className="p-3 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/40 shrink-0">
            <Icon className="h-6 w-6 text-[#c9a84c]" />
          </div>
          <div className="flex-1 min-w-0">
            {badge && (
              <span className="inline-block editorial-label text-[#c9a84c] mb-1">
                {badge}
              </span>
            )}
            <h3 className="editorial-title text-2xl text-[#faf6ec]">
              {title}
            </h3>
            <p className="text-sm text-[#faf6ec]/70 mt-1 line-clamp-2 font-sans-editorial">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#c9a84c] shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  }

  // Default variant — cream card with emerald title and gold-ringed icon
  const content = (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "p-3 rounded-full shrink-0 border transition-colors",
          disabled
            ? "bg-[#faf6ec] border-[#064e3b]/10"
            : "bg-[#faf6ec] border-[#c9a84c]/40 group-hover:border-[#c9a84c] group-hover:bg-[#c9a84c]/10"
        )}
      >
        <Icon className={cn("h-5 w-5", disabled ? "text-[#064e3b]/30" : "text-[#c9a84c]")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={cn(
            "editorial-title text-xl transition-colors",
            disabled ? "text-[#064e3b]/40" : "text-[#064e3b]"
          )}>
            {title}
          </h3>
          {badge && (
            <span className="editorial-label text-[#c9a84c]">
              {badge}
            </span>
          )}
        </div>
        <p className={cn(
          "text-sm mt-0.5 line-clamp-2 font-sans-editorial",
          disabled ? "text-[#064e3b]/30" : "text-[#064e3b]/60"
        )}>
          {description}
        </p>
      </div>
      <ChevronRight className={cn(
        "h-5 w-5 shrink-0 transition-all",
        disabled ? "text-[#064e3b]/20" : "text-[#064e3b]/40 group-hover:text-[#c9a84c] group-hover:translate-x-1"
      )} />
    </div>
  );

  const baseClasses = cn(
    "block p-4 rounded-xl border transition-all duration-300",
    "bg-[#faf6ec]/60 border-[#064e3b]/10",
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
      className={cn(baseClasses, "group hover:border-[#c9a84c]/50 hover:bg-[#faf6ec]")}
    >
      {content}
    </Link>
  );
}
