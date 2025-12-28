import { cn } from "@/lib/utils";

interface TableCardProps {
  number: string | number;
  status?: "available" | "occupied" | "calling";
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  available: {
    label: "Disponível",
    className: "border-border hover:border-primary/50 hover:bg-primary/5",
  },
  occupied: {
    label: "Ocupada",
    className: "border-warning/50 bg-warning/10",
  },
  calling: {
    label: "Chamando",
    className: "border-primary bg-primary/20 animate-pulse",
  },
};

export function TableCard({
  number,
  status = "available",
  selected,
  onClick,
  className,
}: TableCardProps) {
  const config = statusConfig[status];

  return (
    <button
      onClick={onClick}
      disabled={status === "occupied"}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        config.className,
        selected && "border-primary bg-primary/20 ring-2 ring-primary/30",
        className
      )}
    >
      <span className="text-2xl font-bold text-foreground">{number}</span>
      <span className="text-xs text-muted-foreground mt-1">{config.label}</span>
    </button>
  );
}
