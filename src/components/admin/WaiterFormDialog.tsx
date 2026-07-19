import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWaiter, useUpdateWaiter, useAdminWaiters, Waiter } from "@/hooks/useAdminWaiters";
import { useEmployees } from "@/hooks/useStaffSchedule";

interface WaiterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waiter?: Waiter | null;
}

export function WaiterFormDialog({ open, onOpenChange, waiter }: WaiterFormDialogProps) {
  const [name, setName] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [employeeId, setEmployeeId] = useState<string>("none");

  const createWaiter = useCreateWaiter();
  const updateWaiter = useUpdateWaiter();
  const { data: employees } = useEmployees();
  const { data: waiters } = useAdminWaiters();

  useEffect(() => {
    if (waiter) {
      setName(waiter.name);
      setIsAvailable(waiter.is_available);
      setIsActive(waiter.is_active);
      setEmployeeId(waiter.employee_id ?? "none");
    } else {
      setName("");
      setIsAvailable(true);
      setIsActive(true);
      setEmployeeId("none");
    }
  }, [waiter, open]);

  const linkedIds = new Set(
    (waiters ?? [])
      .filter((w) => w.employee_id && w.id !== waiter?.id)
      .map((w) => w.employee_id as string)
  );
  const availableEmployees = (employees ?? []).filter(
    (e) => e.is_active && !linkedIds.has(e.id)
  );

  const handleEmployeeChange = (value: string) => {
    setEmployeeId(value);
    if (value !== "none" && !name.trim()) {
      const emp = employees?.find((e) => e.id === value);
      if (emp) setName(emp.full_name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name,
      is_available: isAvailable,
      is_active: isActive,
      user_id: null,
      employee_id: employeeId === "none" ? null : employeeId,
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
            <Label htmlFor="employee">Funcionário (Agenda)</Label>
            <Select value={employeeId} onValueChange={handleEmployeeChange}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Sem vínculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {availableEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name}{e.role ? ` — ${e.role}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vincule a um funcionário cadastrado no módulo Agenda para reaproveitar dados.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Atendente</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome ou apelido"
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
