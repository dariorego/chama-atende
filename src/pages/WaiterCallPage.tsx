import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WaiterCallPage = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const { toast } = useToast();

  const handleCallWaiter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o número da mesa",
        variant: "destructive",
      });
      return;
    }

    setIsCalling(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsCalling(false);
    setCallSent(true);

    toast({
      title: "Atendimento solicitado!",
      description: `Solicitação enviada para a mesa ${tableNumber}`,
    });

    // Reset after a few seconds
    setTimeout(() => {
      setCallSent(false);
      setTableNumber("");
    }, 5000);
  };

  return (
    <ClientLayout title="Solicitar Atendimento" showBack backTo="/">
      {/* Instructions */}
      <div className="mb-6 p-4 bg-secondary rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">
          Informe o número da sua mesa e toque em{" "}
          <span className="text-primary font-medium">"Solicitar Atendimento"</span> para
          chamar um atendente.
        </p>
      </div>

      {/* Success State */}
      {callSent ? (
        <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Solicitação enviada!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Um atendente irá até a mesa <span className="text-primary font-medium">{tableNumber}</span> em breve
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCallWaiter} className="space-y-6">
          {/* Table Number Input */}
          <div className="space-y-2">
            <Label htmlFor="tableNumber">Número da Mesa</Label>
            <Input
              id="tableNumber"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 12"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="h-14 text-center text-2xl font-bold bg-secondary border-border text-foreground"
              maxLength={4}
            />
          </div>

          {/* Call Button */}
          <Button
            type="submit"
            disabled={isCalling}
            className="w-full h-14 text-lg font-semibold shadow-glow"
            size="lg"
          >
            {isCalling ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Solicitar Atendimento
              </span>
            )}
          </Button>
        </form>
      )}
    </ClientLayout>
  );
};

export default WaiterCallPage;
