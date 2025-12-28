import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { TableCard } from "@/components/ui/table-card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data - will be replaced with Supabase data
const tables = [
  { id: "1", number: 1, status: "available" as const },
  { id: "2", number: 2, status: "occupied" as const },
  { id: "3", number: 3, status: "available" as const },
  { id: "4", number: 4, status: "available" as const },
  { id: "5", number: 5, status: "occupied" as const },
  { id: "6", number: 6, status: "available" as const },
  { id: "7", number: 7, status: "available" as const },
  { id: "8", number: 8, status: "available" as const },
  { id: "9", number: 9, status: "occupied" as const },
  { id: "10", number: 10, status: "available" as const },
  { id: "11", number: 11, status: "available" as const },
  { id: "12", number: 12, status: "available" as const },
];

const WaiterCallPage = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const { toast } = useToast();

  const handleCallWaiter = async () => {
    if (!selectedTable) return;

    setIsCalling(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsCalling(false);
    setCallSent(true);

    toast({
      title: "Garçom chamado!",
      description: `Atendimento solicitado para a mesa ${tables.find((t) => t.id === selectedTable)?.number}`,
    });

    // Reset after a few seconds
    setTimeout(() => {
      setCallSent(false);
      setSelectedTable(null);
    }, 5000);
  };

  return (
    <ClientLayout title="Chamar Garçom" showBack backTo="/">
      {/* Instructions */}
      <div className="mb-6 p-4 bg-secondary rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">
          Selecione sua mesa e toque em <span className="text-primary font-medium">"Chamar Garçom"</span> para
          solicitar atendimento.
        </p>
      </div>

      {/* Success State */}
      {callSent && (
        <div className="mb-6 p-6 bg-primary/10 border border-primary/30 rounded-xl animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Chamada enviada!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Um garçom irá até sua mesa em breve
            </p>
          </div>
        </div>
      )}

      {/* Table Grid */}
      {!callSent && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Selecione sua mesa
          </h2>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {tables.map((table, index) => (
              <div
                key={table.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <TableCard
                  number={table.number}
                  status={table.status}
                  selected={selectedTable === table.id}
                  onClick={() => setSelectedTable(table.id)}
                />
              </div>
            ))}
          </div>

          {/* Call Button */}
          <Button
            onClick={handleCallWaiter}
            disabled={!selectedTable || isCalling}
            className="w-full h-14 text-lg font-semibold shadow-glow"
            size="lg"
          >
            {isCalling ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Chamando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Chamar Garçom
              </span>
            )}
          </Button>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary border border-border" />
              Disponível
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning/30 border border-warning/50" />
              Ocupada
            </span>
          </div>
        </>
      )}
    </ClientLayout>
  );
};

export default WaiterCallPage;
