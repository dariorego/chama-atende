import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateBatchTables, useAdminTables } from "@/hooks/useAdminTables";
import { LayoutGrid } from "lucide-react";

interface BatchTableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchTableFormDialog({ open, onOpenChange }: BatchTableFormDialogProps) {
  const { data: existingTables } = useAdminTables();
  const createBatchTables = useCreateBatchTables();

  const [startNumber, setStartNumber] = useState(1);
  const [endNumber, setEndNumber] = useState(20);
  const [capacity, setCapacity] = useState(4);
  const [skipExisting, setSkipExisting] = useState(true);

  const existingNumbers = useMemo(() => {
    return existingTables?.map(t => t.number) || [];
  }, [existingTables]);

  const preview = useMemo(() => {
    if (startNumber > endNumber || startNumber < 1 || endNumber < 1) {
      return { count: 0, skipped: 0 };
    }

    let count = 0;
    let skipped = 0;

    for (let i = startNumber; i <= endNumber; i++) {
      if (existingNumbers.includes(i)) {
        if (skipExisting) {
          skipped++;
        }
      } else {
        count++;
      }
    }

    if (!skipExisting) {
      skipped = existingNumbers.filter(n => n >= startNumber && n <= endNumber).length;
    }

    return { count, skipped };
  }, [startNumber, endNumber, existingNumbers, skipExisting]);

  useEffect(() => {
    if (open) {
      // Suggest starting from the next available number
      const maxExisting = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      setStartNumber(maxExisting + 1);
      setEndNumber(maxExisting + 20);
      setCapacity(4);
      setSkipExisting(true);
    }
  }, [open, existingNumbers]);

  const handleSubmit = () => {
    createBatchTables.mutate(
      { startNumber, endNumber, capacity, skipExisting },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isValid = startNumber > 0 && endNumber > 0 && startNumber <= endNumber && 
                  endNumber - startNumber < 50 && capacity > 0 && preview.count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Criar Mesas em Sequência
          </DialogTitle>
          <DialogDescription>
            Crie múltiplas mesas de uma vez com numeração sequencial
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startNumber">Número Inicial</Label>
              <Input
                id="startNumber"
                type="number"
                min={1}
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endNumber">Número Final</Label>
              <Input
                id="endNumber"
                type="number"
                min={1}
                value={endNumber}
                onChange={(e) => setEndNumber(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade (lugares por mesa)</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="skipExisting"
              checked={skipExisting}
              onCheckedChange={(checked) => setSkipExisting(checked === true)}
            />
            <Label htmlFor="skipExisting" className="cursor-pointer">
              Pular mesas já existentes
            </Label>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
            <div className="text-sm font-medium">
              📊 Serão criadas: <span className="text-primary font-bold">{preview.count} mesas</span>
            </div>
            {preview.skipped > 0 && (
              <div className="text-xs text-muted-foreground">
                {skipExisting 
                  ? `(${preview.skipped} já existentes serão puladas)` 
                  : `⚠️ ${preview.skipped} mesas já existem e causarão erro`
                }
              </div>
            )}
            {endNumber - startNumber >= 50 && (
              <div className="text-xs text-destructive">
                ⚠️ Limite máximo de 50 mesas por vez
              </div>
            )}
            {preview.count === 0 && startNumber <= endNumber && (
              <div className="text-xs text-muted-foreground">
                Todas as mesas neste intervalo já existem
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || createBatchTables.isPending}
          >
            {createBatchTables.isPending ? "Criando..." : `Criar ${preview.count} Mesas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
