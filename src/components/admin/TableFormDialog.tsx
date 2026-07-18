import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTable, useUpdateTable, Table } from "@/hooks/useAdminTables";
import { useAdminTables } from "@/hooks/useAdminTables";

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Table | null;
}

export function TableFormDialog({ open, onOpenChange, table }: TableFormDialogProps) {
  const [number, setNumber] = useState(1);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<Table['status']>('available');
  const [isActive, setIsActive] = useState(true);
  const [area, setArea] = useState("Salão");
  const [shape, setShape] = useState<Table['shape']>('square');

  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const { data: allTables } = useAdminTables();
  const existingAreas = Array.from(
    new Set((allTables ?? []).map((t) => t.area).filter(Boolean))
  );

  useEffect(() => {
    if (table) {
      setNumber(table.number);
      setName(table.name || "");
      setCapacity(table.capacity);
      setStatus(table.status);
      setIsActive(table.is_active);
      setArea(table.area || "Salão");
      setShape(table.shape || 'square');
    } else {
      setNumber(1);
      setName("");
      setCapacity(4);
      setStatus('available');
      setIsActive(true);
      setArea("Salão");
      setShape('square');
    }
  }, [table, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      number,
      name: name || null,
      capacity,
      status,
      is_active: isActive,
      area: area || "Salão",
      shape,
    };

    if (table) {
      await updateTable.mutateAsync({ id: table.id, ...data });
    } else {
      await createTable.mutateAsync(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? "Editar Mesa" : "Nova Mesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número da Mesa</Label>
              <Input
                id="number"
                type="number"
                min={1}
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome/Identificação (opcional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Varanda, VIP, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área / Salão</Label>
              <Input
                id="area"
                list="area-options"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Salão, Varanda, Deck"
              />
              <datalist id="area-options">
                {existingAreas.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shape">Formato</Label>
              <Select value={shape} onValueChange={(v) => setShape(v as Table['shape'])}>
                <SelectTrigger id="shape"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Quadrada</SelectItem>
                  <SelectItem value="round">Redonda</SelectItem>
                  <SelectItem value="rect">Retangular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Table['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Mesa Ativa</Label>
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
            <Button type="submit" disabled={createTable.isPending || updateTable.isPending}>
              {table ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
