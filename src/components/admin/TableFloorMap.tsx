import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Pencil, Plus, MapPin } from "lucide-react";
import { Table as TableType, useUpdateTablePosition } from "@/hooks/useAdminTables";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TableFloorMapProps {
  tables: TableType[];
  onEdit: (t: TableType) => void;
  onShowQR: (t: TableType) => void;
  onCreate: () => void;
}

const statusStyles: Record<TableType['status'], string> = {
  available: 'border-green-500 bg-green-500/15 text-green-950 dark:text-green-100',
  occupied: 'border-amber-500 bg-amber-500/20 text-amber-950 dark:text-amber-100',
  reserved: 'border-blue-500 bg-blue-500/15 text-blue-950 dark:text-blue-100',
  inactive: 'border-muted bg-muted/50 text-muted-foreground opacity-60',
};

const shapeStyles: Record<NonNullable<TableType['shape']>, string> = {
  square: 'rounded-lg w-20 h-20',
  round: 'rounded-full w-20 h-20',
  rect: 'rounded-lg w-28 h-16',
};

export function TableFloorMap({ tables, onEdit, onShowQR, onCreate }: TableFloorMapProps) {
  const areas = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => set.add(t.area || "Salão"));
    if (set.size === 0) set.add("Salão");
    return Array.from(set);
  }, [tables]);

  const [active, setActive] = useState(areas[0] || "Salão");
  const [addAreaOpen, setAddAreaOpen] = useState(false);
  const [newArea, setNewArea] = useState("");

  const activeArea = areas.includes(active) ? active : areas[0];

  return (
    <div className="space-y-4">
      <Tabs value={activeArea} onValueChange={setActive}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TabsList className="flex-wrap h-auto">
            {areas.map((a) => (
              <TabsTrigger key={a} value={a}>
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {a}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAddAreaOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova Área
            </Button>
          </div>
        </div>

        {areas.map((a) => (
          <TabsContent key={a} value={a} className="mt-4">
            <FloorCanvas
              area={a}
              tables={tables.filter((t) => (t.area || "Salão") === a)}
              onEdit={onEdit}
              onShowQR={onShowQR}
              onCreate={onCreate}
            />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={addAreaOpen} onOpenChange={setAddAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Área</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-area">Nome da área</Label>
            <Input
              id="new-area"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Ex: Varanda, Deck, Mezanino"
            />
            <p className="text-xs text-muted-foreground">
              A área ficará disponível ao criar ou editar uma mesa e atribuí-la a este setor.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAreaOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (newArea.trim()) {
                  setActive(newArea.trim());
                  setAddAreaOpen(false);
                  setNewArea("");
                }
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FloorCanvasProps {
  area: string;
  tables: TableType[];
  onEdit: (t: TableType) => void;
  onShowQR: (t: TableType) => void;
  onCreate: () => void;
}

function FloorCanvas({ area, tables, onEdit, onShowQR, onCreate }: FloorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const updatePos = useUpdateTablePosition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, { x: number; y: number }>>({});

  const startDrag = (e: React.PointerEvent, table: TableType) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDragId(table.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      setPreview((p) => ({
        ...p,
        [table.id]: {
          x: Math.max(2, Math.min(96, x)),
          y: Math.max(2, Math.min(96, y)),
        },
      }));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragId(null);
      const pos = previewRef.current[table.id];
      if (pos) {
        updatePos.mutate({ id: table.id, position_x: pos.x, position_y: pos.y, area });
      }
      setPreview((p) => {
        const rest = { ...p };
        delete rest[table.id];
        return rest;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  if (tables.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl min-h-[420px] flex flex-col items-center justify-center gap-3 bg-surface/30">
        <p className="text-muted-foreground">Nenhuma mesa nesta área.</p>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar mesa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Disponível</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Ocupada</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Reservada</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-muted" /> Inativa</span>
        <span className="ml-auto italic">Arraste as mesas para reposicionar</span>
      </div>
      <div
        ref={canvasRef}
        className="relative w-full rounded-xl border-2 border-dashed bg-[linear-gradient(90deg,transparent_calc(10%_-_1px),hsl(var(--border))_10%,transparent_calc(10%_+_1px)),linear-gradient(180deg,transparent_calc(10%_-_1px),hsl(var(--border))_10%,transparent_calc(10%_+_1px))] bg-surface/20"
        style={{ height: 560, backgroundSize: '10% 10%' }}
      >
        {tables.map((t) => {
          const pos = preview[t.id] ?? { x: t.position_x ?? 50, y: t.position_y ?? 50 };
          const shape = shapeStyles[(t.shape as keyof typeof shapeStyles) || 'square'];
          const style = statusStyles[t.status];
          const isDragging = dragId === t.id;
          return (
            <div
              key={t.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group ${isDragging ? 'z-20' : 'z-10'}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                onPointerDown={(e) => startDrag(e, t)}
                onDoubleClick={() => onEdit(t)}
                className={`relative flex flex-col items-center justify-center border-2 shadow-md cursor-grab active:cursor-grabbing select-none transition-transform ${shape} ${style} ${isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'}`}
                title={`Mesa ${t.number} — duplo clique para editar`}
              >
                <div className="text-xl font-bold leading-none">
                  {t.number.toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] flex items-center gap-0.5 mt-0.5 opacity-80">
                  <Users className="h-2.5 w-2.5" /> {t.capacity}
                </div>
                {t.name && <div className="text-[9px] truncate max-w-[70px] mt-0.5">{t.name}</div>}
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onShowQR(t)}
                  className="p-1 rounded-full bg-background border shadow hover:bg-accent"
                  title="QR Code"
                >
                  <QrCode className="h-3 w-3" />
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onEdit(t)}
                  className="p-1 rounded-full bg-background border shadow hover:bg-accent"
                  title="Editar"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}