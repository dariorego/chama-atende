import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  MapPin,
  Star,
  Bell,
  Receipt,
  ChevronRight,
  X,
  Hourglass,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useTableContext } from "@/hooks/useTableContext";
import { useClientServiceCall } from "@/hooks/useClientServiceCall";
import { usePublicTables } from "@/hooks/usePublicTables";

interface TableData {
  id: string;
  number: number;
  name: string | null;
  capacity: number | null;
  status: string | null;
}

const WaiterCallPage = () => {
  const navigate = useNavigate();
  const { tableId: urlTableId } = useParams<{ tableId: string }>();
  const { toast } = useToast();
  const { table: contextTable, isLoading: isLoadingContext, setTable } = useTableContext();
  
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(!!urlTableId);
  const [activeTab, setActiveTab] = useState("atendimento");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [isSettingTable, setIsSettingTable] = useState(false);

  const { restaurant, isLoading } = useAdminSettings();
  const { data: tables, isLoading: isLoadingTables } = usePublicTables();
  
  // Hook for service calls - uses tableData.id when available
  const { 
    pendingCalls,
    hasActiveCall, 
    createCall, 
    cancelCall, 
    isCreatingCall,
    isCancellingCall,
  } = useClientServiceCall(tableData?.id || null);

  // Redirect old QR codes to new format
  useEffect(() => {
    if (urlTableId) {
      navigate(`/?mesa=${urlTableId}`, { replace: true });
    }
  }, [urlTableId, navigate]);

  // Use table from context if available
  useEffect(() => {
    if (!urlTableId && contextTable) {
      setTableData({
        id: contextTable.id,
        number: contextTable.number,
        name: contextTable.name,
        capacity: contextTable.capacity,
        status: null,
      });
      setIsLoadingTable(false);
    } else if (!urlTableId && !isLoadingContext) {
      setIsLoadingTable(false);
    }
  }, [contextTable, urlTableId, isLoadingContext]);

  const tableNumber = tableData?.number?.toString().padStart(2, "0") || "00";

  // Derive state from hook
  const isWaiterCalled = hasActiveCall("waiter");
  const isBillRequested = hasActiveCall("bill");
  const isRequestActive = isWaiterCalled || isBillRequested;

  const handleCallWaiter = async () => {
    if (!tableData?.id) return;
    
    try {
      await createCall({
        tableId: tableData.id,
        sessionId: null,
        callType: "waiter",
      });
      toast({
        title: "Garçom chamado!",
        description: "Um atendente está a caminho da sua mesa.",
      });
    } catch (error) {
      toast({
        title: "Erro ao chamar garçom",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRequestBill = async () => {
    if (!tableData?.id) return;
    
    try {
      await createCall({
        tableId: tableData.id,
        sessionId: null,
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

  const handleCancelRequest = async () => {
    const activeCalls = pendingCalls.filter(c => 
      ["pending", "acknowledged", "in_progress"].includes(c.status || "")
    );
    
    try {
      for (const call of activeCalls) {
        await cancelCall(call.id);
      }
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

  if (isLoading || isLoadingTable || isLoadingContext) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSelectTable = async () => {
    if (!selectedTableId) return;
    setIsSettingTable(true);
    const success = await setTable(selectedTableId);
    if (success) {
      const selectedTable = tables?.find(t => t.id === selectedTableId);
      if (selectedTable) {
        setTableData({
          id: selectedTable.id,
          number: selectedTable.number,
          name: selectedTable.name,
          capacity: selectedTable.capacity,
          status: selectedTable.status,
        });
      }
    }
    setIsSettingTable(false);
  };

  if (!tableData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Qual é sua mesa?
            </h1>
            <p className="text-muted-foreground text-sm">
              Selecione sua mesa para solicitar atendimento
            </p>
          </div>

          <div className="space-y-4">
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger className="w-full h-14 text-lg bg-surface border-border">
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTables ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  tables?.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Mesa {table.number.toString().padStart(2, "0")}
                      {table.name ? ` - ${table.name}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSelectTable}
              disabled={!selectedTableId || isSettingTable}
              className="w-full h-12"
            >
              {isSettingTable ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Confirmando...
                </>
              ) : (
                "Confirmar Mesa"
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Escaneie o QR Code da sua mesa para identificação automática
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full text-primary font-medium hover:underline text-center"
          >
            Voltar ao início
          </button>
        </div>
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
          src={
            restaurant.cover_image_url ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"
          }
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
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
          {/* Open badge */}
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
              onClick={() => navigate("/cardapio")}
            >
              Cardápio
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 pb-32">
        {/* Status Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Conectado</span>
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
                textShadow: "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)",
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
            disabled={isRequestActive || isCreatingCall}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center gap-4 hover:from-primary/30 hover:to-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
              {isCreatingCall ? (
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              ) : (
                <Bell className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground text-lg">Solicitar Atendimento</h3>
              <p className="text-sm text-muted-foreground">Chamar Atendente na mesa</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* Request Bill Card */}
          <button
            onClick={handleRequestBill}
            disabled={isRequestActive || isCreatingCall}
            className="w-full p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-4 hover:bg-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
              {isCreatingCall ? (
                <Loader2 className="h-7 w-7 text-muted-foreground animate-spin" />
              ) : (
                <Receipt className="h-7 w-7 text-muted-foreground" />
              )}
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
        <div className="fixed bottom-0 left-0 right-0 bg-primary p-4 animate-fade-in z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">
                  {isWaiterCalled ? "Garçom a caminho..." : "Preparando sua conta..."}
                </p>
                <p className="text-xs text-primary-foreground/70">Aguarde um momento</p>
              </div>
            </div>
            <button
              onClick={handleCancelRequest}
              disabled={isCancellingCall}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-medium text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isCancellingCall ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterCallPage;
