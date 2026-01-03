import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, MoreHorizontal, MapPin, Star, Bell, Receipt, ChevronRight, X, Hourglass, Loader2, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { usePublicTables } from "@/hooks/usePublicTables";
import { useClientServiceCall } from "@/hooks/useClientServiceCall";
import { cn } from "@/lib/utils";

const WaiterCallPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("atendimento");
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  const { restaurant, isLoading: restaurantLoading } = useAdminSettings();
  const { data: tables = [], isLoading: tablesLoading } = usePublicTables();
  const { 
    activeSession, 
    pendingCalls, 
    isLoading: callsLoading,
    hasActiveCall,
    createSession,
    createCall,
    cancelCall,
    isCreatingCall,
    isCancellingCall,
  } = useClientServiceCall(selectedTableId);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  // Timer for elapsed time on pending calls
  useEffect(() => {
    if (pendingCalls.length === 0) return;

    const interval = setInterval(() => {
      const newElapsed: Record<string, number> = {};
      pendingCalls.forEach(call => {
        if (call.called_at) {
          const start = new Date(call.called_at).getTime();
          const now = Date.now();
          newElapsed[call.id] = Math.floor((now - start) / 1000);
        }
      });
      setElapsedTime(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingCalls]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectTable = async (tableId: string) => {
    setSelectedTableId(tableId);
    try {
      await createSession(tableId);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleCallWaiter = async () => {
    if (!selectedTableId) return;
    
    try {
      await createCall({
        tableId: selectedTableId,
        sessionId: activeSession?.id || null,
        callType: "waiter",
      });
      toast({
        title: "Atendente chamado!",
        description: "Um atendente está a caminho da sua mesa.",
      });
    } catch (error) {
      toast({
        title: "Erro ao chamar atendente",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRequestBill = async () => {
    if (!selectedTableId) return;
    
    try {
      await createCall({
        tableId: selectedTableId,
        sessionId: activeSession?.id || null,
        callType: "bill",
      });
      toast({
        title: "Conta solicitada!",
        description: "Aguarde, a conta está sendo preparada.",
      });
    } catch (error) {
      toast({
        title: "Erro ao solicitar conta",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancelCall = async (callId: string) => {
    try {
      await cancelCall(callId);
      toast({
        title: "Solicitação cancelada",
        description: "Sua solicitação foi cancelada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending": return "Aguardando atendente...";
      case "acknowledged": return "Atendente notificado";
      case "in_progress": return "Atendente a caminho";
      default: return "Processando...";
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case "waiter": return "Atendente";
      case "bill": return "Conta";
      case "help": return "Ajuda";
      default: return type;
    }
  };

  const isLoading = restaurantLoading || tablesLoading;
  const hasActiveCalls = pendingCalls.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Restaurante não encontrado</h1>
        <p className="text-muted-foreground text-center">
          O restaurante que você está procurando não existe ou está inativo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-80">
        <img
          src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => selectedTableId ? setSelectedTableId(null) : navigate('/')}
            className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/10"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Share2 className="h-5 w-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <MoreHorizontal className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Restaurant info over image */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              {restaurant.status === "open" ? "Aberto agora" : "Fechado"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
          
          <div className="flex items-center gap-4">
            {restaurant.address && (
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{restaurant.address.split(",")[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 bg-surface-dark/80 backdrop-blur-sm rounded-2xl p-1">
            <TabsTrigger
              value="atendimento"
              className="flex-1 h-10 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Solicitar Atendimento
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="flex-1 h-10 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => navigate('/cardapio')}
            >
              Cardápio
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 pb-32">
        {!selectedTableId ? (
          // Table Selection
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Selecione sua mesa</h2>
              <p className="text-sm text-muted-foreground">Toque na mesa em que você está sentado</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table.id)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all",
                    table.status === "available" 
                      ? "bg-primary/10 border-primary/30 hover:bg-primary/20" 
                      : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                  )}
                >
                  <span className="text-2xl font-bold text-foreground">
                    {table.number.toString().padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{table.capacity}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <span>Ocupada</span>
              </div>
            </div>
          </>
        ) : (
          // Selected Table Actions
          <>
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
                  {selectedTable?.number.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="space-y-4 pt-4">
              {/* Call Waiter Card */}
              <button
                onClick={handleCallWaiter}
                disabled={hasActiveCall("waiter") || isCreatingCall}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center gap-4 hover:from-primary/30 hover:to-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground text-lg">Chamar Atendente</h3>
                  <p className="text-sm text-muted-foreground">Solicitar atendimento na mesa</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Request Bill Card */}
              <button
                onClick={handleRequestBill}
                disabled={hasActiveCall("bill") || isCreatingCall}
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

            {/* Active Calls List */}
            {pendingCalls.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Solicitações Ativas
                </h3>
                {pendingCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 rounded-2xl bg-primary/10 border border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {call.call_type === "waiter" ? (
                            <Bell className="h-5 w-5 text-primary" />
                          ) : (
                            <Receipt className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getCallTypeLabel(call.call_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getStatusLabel(call.status)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-mono font-semibold text-primary">
                            {formatTime(elapsedTime[call.id] || 0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelCall(call.id)}
                          disabled={isCancellingCall}
                          className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Active Request Bar (Mobile-friendly bottom bar) */}
      {hasActiveCalls && selectedTableId && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary p-4 animate-fade-in z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">
                  {pendingCalls.length} solicitação{pendingCalls.length > 1 ? "ões" : ""} ativa{pendingCalls.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-primary-foreground/70">
                  Aguarde um momento
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterCallPage;
