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
  defaultArea?: string;
}

export function TableFormDialog({ open, onOpenChange, table, defaultArea }: TableFormDialogProps) {
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
  const areaOptions = Array.from(new Set([...(existingAreas as string[]), "Salão"]));
  const isNewArea = area && !areaOptions.includes(area);
  const [creatingNewArea, setCreatingNewArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  useEffect(() => {
    if (isNewArea) setCreatingNewArea(true);
  }, [open]);

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
      setArea(defaultArea || "Salão");
      setShape('square');
    }
  }, [table, open, defaultArea]);

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
              {creatingNewArea ? (
                <div className="flex gap-2">
                  <Input
                    id="area"
                    autoFocus
                    value={newAreaName}
                    onChange={(e) => {
                      setNewAreaName(e.target.value);
                      setArea(e.target.value);
                    }}
                    placeholder="Nome da nova área"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreatingNewArea(false);
                      setNewAreaName("");
                      setArea(areaOptions[0] || "Salão");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Select
                  value={area}
                  onValueChange={(v) => {
                    if (v === "__new__") {
                      setCreatingNewArea(true);
                      setNewAreaName("");
                      setArea("");
                    } else {
                      setArea(v);
                    }
                  }}
                >
                  <SelectTrigger id="area"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Nova área…</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
