import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, Bell, Receipt, ChevronRight, X, Hourglass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WaiterCallPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tableNumber] = useState("05");
  const [isWaiterCalled, setIsWaiterCalled] = useState(false);
  const [isBillRequested, setIsBillRequested] = useState(false);

  const handleCallWaiter = () => {
    setIsWaiterCalled(true);
    toast({
      title: "Garçom chamado!",
      description: "Um atendente está a caminho da sua mesa.",
    });
  };

  const handleRequestBill = () => {
    setIsBillRequested(true);
    toast({
      title: "Conta solicitada!",
      description: "Aguarde, a conta está sendo preparada.",
    });
  };

  const handleCancelRequest = () => {
    setIsWaiterCalled(false);
    setIsBillRequested(false);
    toast({
      title: "Solicitação cancelada",
      description: "Sua solicitação foi cancelada com sucesso.",
    });
  };

  const isRequestActive = isWaiterCalled || isBillRequested;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-background px-4 py-4 border-b border-border/50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Meu Pedido</h2>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 space-y-8">
        {/* Status Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Conectado
            </span>
          </div>
        </div>

        {/* Table Display */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Você está ocupando a</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-foreground">Mesa</span>
            <span 
              className="text-6xl font-black text-primary"
              style={{
                textShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)'
              }}
            >
              {tableNumber}
            </span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-4 pt-4">
          {/* Call Waiter Card */}
          <button
            onClick={handleCallWaiter}
            disabled={isRequestActive}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center gap-4 hover:from-primary/30 hover:to-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
              <Bell className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground text-lg">Solicitar Atendimento</h3>
              <p className="text-sm text-muted-foreground">Chamar garçom na mesa</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* Request Bill Card */}
          <button
            onClick={handleRequestBill}
            disabled={isRequestActive}
            className="w-full p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-4 hover:bg-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
              <Receipt className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground text-lg">Pedir a Conta</h3>
              <p className="text-sm text-muted-foreground">Fechar e realizar pagamento</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>

      {/* Active Request Bar */}
      {isRequestActive && (
        <div className="sticky bottom-0 left-0 right-0 bg-primary p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">
                  {isWaiterCalled ? "Garçom a caminho..." : "Preparando sua conta..."}
                </p>
                <p className="text-xs text-primary-foreground/70">
                  Aguarde um momento
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelRequest}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-medium text-sm hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterCallPage;
