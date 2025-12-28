import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "open" | "closed" | "busy";
  className?: string;
}

const statusConfig = {
  open: {
    label: "Aberto",
    className: "bg-success/20 text-success border-success/30",
  },
  closed: {
    label: "Fechado",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  busy: {
    label: "Lotado",
    className: "bg-warning/20 text-warning border-warning/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
}
