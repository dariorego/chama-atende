import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ALL_DAYS, DAY_INITIALS, DAY_SHORT_LABELS, formatAvailabilityLabel } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface AvailabilityFieldsProps {
  enabled: boolean;
  days: number[];
  from: string;
  to: string;
  onEnabledChange: (value: boolean) => void;
  onDaysChange: (value: number[]) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  /** Extra hint about what gets hidden when outside the window */
  scopeLabel?: string;
}

export function AvailabilityFields({
  enabled,
  days,
  from,
  to,
  onEnabledChange,
  onDaysChange,
  onFromChange,
  onToChange,
  scopeLabel = "o item",
}: AvailabilityFieldsProps) {
  const toggleDay = (day: number) => {
    onDaysChange(
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b),
    );
  };

  const preview = formatAvailabilityLabel({
    availability_enabled: enabled,
    available_days: days,
    available_from: from || null,
    available_to: to || null,
  });

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Disponibilidade por dia/horário</Label>
          <p className="text-xs text-muted-foreground">
            Quando ativado, fora da janela configurada {scopeLabel} fica oculto no cardápio.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Dias da semana</Label>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-label={DAY_SHORT_LABELS[day]}
                    aria-pressed={active}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "h-9 w-9 rounded-full text-sm font-medium transition-colors border",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface text-surface-foreground border-border hover:border-primary/50",
                    )}
                  >
                    {DAY_INITIALS[day]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Início</Label>
              <Input
                type="time"
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fim</Label>
              <Input
                type="time"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
          </div>

          {days.length === 0 ? (
            <p className="text-xs text-destructive">Selecione ao menos um dia da semana.</p>
          ) : (
            preview && <p className="text-xs text-muted-foreground">Disponível: {preview}</p>
          )}
        </div>
      )}
    </div>
  );
}
