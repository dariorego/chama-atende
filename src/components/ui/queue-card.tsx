import { cn } from "@/lib/utils";
import { Users, Clock } from "lucide-react";

interface QueueCardProps {
  position: number;
  name: string;
  partySize: number;
  waitTime?: string;
  isCurrentUser?: boolean;
  className?: string;
}

export function QueueCard({
  position,
  name,
  partySize,
  waitTime,
  isCurrentUser,
  className,
}: QueueCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all",
        isCurrentUser
          ? "border-primary bg-primary/10"
          : "border-border bg-card",
        className
      )}
    >
      {/* Position */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        )}
      >
        {position}º
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-primary">(Você)</span>
          )}
        </p>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {partySize} {partySize === 1 ? "pessoa" : "pessoas"}
          </span>
          {waitTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{waitTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
