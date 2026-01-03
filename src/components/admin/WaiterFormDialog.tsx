import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateWaiter, useUpdateWaiter, Waiter } from "@/hooks/useAdminWaiters";

interface WaiterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waiter?: Waiter | null;
}

export function WaiterFormDialog({ open, onOpenChange, waiter }: WaiterFormDialogProps) {
  const [name, setName] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const createWaiter = useCreateWaiter();
  const updateWaiter = useUpdateWaiter();

  useEffect(() => {
    if (waiter) {
      setName(waiter.name);
      setIsAvailable(waiter.is_available);
      setIsActive(waiter.is_active);
    } else {
      setName("");
      setIsAvailable(true);
      setIsActive(true);
    }
  }, [waiter, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name,
      is_available: isAvailable,
      is_active: isActive,
      user_id: null,
    };

    if (waiter) {
      await updateWaiter.mutateAsync({ id: waiter.id, ...data });
    } else {
      await createWaiter.mutateAsync(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{waiter ? "Editar Atendente" : "Novo Atendente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Atendente</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="available">Disponível</Label>
              <p className="text-sm text-muted-foreground">
                Pode receber novos atendimentos
              </p>
            </div>
            <Switch
              id="available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="active">Atendente Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Visível no sistema
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createWaiter.isPending || updateWaiter.isPending}>
              {waiter ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
