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
import { useTenant } from "@/hooks/useTenant";

interface TableData {
  id: string;
  number: number;
  name: string | null;
  capacity: number | null;
  status: string | null;
}

const WaiterCallPage = () => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { tableId: urlTableId } = useParams<{ tableId: string }>();
  const { toast } = useToast();
  const { table: contextTable, isLoading: isLoadingContext, setTable } = useTableContext();
  
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(!!urlTableId);
  const [activeTab, setActiveTab] = useState("atendimento");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [isSettingTable, setIsSettingTable] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<"waiter" | "bill" | null>(null);

  const { customerName, saveName } = useCustomerName();
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

  // Derive state from hook (apenas chamados deste cliente bloqueiam)
  const isWaiterCalled = hasActiveCall("waiter", customerName);
  const isBillRequested = hasActiveCall("bill", customerName);
  const isRequestActive = isWaiterCalled || isBillRequested;

  const sendCall = async (callType: "waiter" | "bill", name: string | null) => {
    if (!tableData?.id) return;

    try {
      await createCall({
        tableId: tableData.id,
        sessionId: null,
        callType,
        customerName: name,
      });
      toast({
        title: callType === "waiter" ? "Garçom chamado!" : "Conta solicitada!",
        description: callType === "waiter"
          ? `Um atendente está a caminho da sua mesa${name ? `, ${name}` : ""}.`
          : "Aguarde, a conta está sendo preparada.",
      });
    } catch (error) {
      toast({
        title: callType === "waiter" ? "Erro ao chamar garçom" : "Erro ao solicitar conta",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const requestCall = (callType: "waiter" | "bill") => {
    if (!tableData?.id) return;
    if (!customerName) {
      setPendingType(callType);
      setNameDialogOpen(true);
      return;
    }
    void sendCall(callType, customerName);
  };

  const handleCallWaiter = () => requestCall("waiter");
  const handleRequestBill = () => requestCall("bill");

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
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
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-cream-soft border border-gold flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-gold" />
            </div>
            <p className="editorial-label text-gold mb-1">Identificação</p>
            <h1 className="text-3xl font-serif-editorial text-emerald-deep mb-2">
              Qual é sua mesa?
            </h1>
            <p className="text-emerald-deep/60 text-sm font-sans-editorial">
              Selecione sua mesa para solicitar atendimento
            </p>
          </div>

          <div className="space-y-4">
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger className="w-full h-14 text-lg bg-cream-soft border-emerald-deep/15 text-emerald-deep">
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTables ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-deep" />
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
              className="w-full h-14 rounded-full bg-emerald-deep text-cream font-sans-editorial border border-gold/40 hover:bg-emerald-deep/90"
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
              <span className="w-full border-t border-emerald-deep/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cream px-2 text-emerald-deep/60 tracking-[0.28em] font-sans-editorial">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-emerald-deep/60 font-sans-editorial">
            Escaneie o QR Code da sua mesa para identificação automática
          </p>

          <button
            onClick={() => navigate(tenant?.slug ? `/${tenant.slug}` : "/")}
            className="w-full text-emerald-deep font-sans-editorial hover:underline text-center underline-offset-4"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-serif-editorial text-emerald-deep mb-2">Estabelecimento não encontrado</h1>
        <p className="text-emerald-deep/60 text-center font-sans-editorial">
          O estabelecimento que você está procurando não existe ou está inativo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
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
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-emerald-deep/40 to-emerald-deep/20" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(tenant?.slug ? `/${tenant.slug}` : "/")}
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
          <p className="editorial-label text-gold mb-2">Atendimento na mesa</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 backdrop-blur-sm border border-gold mb-3">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-sans-editorial text-white uppercase tracking-wider">
              {restaurant.status === "open" ? "Aberto agora" : "Fechado"}
            </span>
          </div>

          <h1 className="text-4xl font-serif-editorial text-white mb-1">{restaurant.name}</h1>

          <div className="flex items-center gap-4">
            {restaurant.address && (
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-sans-editorial">{restaurant.address.split(",")[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-gold/40">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="text-sm font-sans-editorial text-white">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 bg-cream-soft border border-emerald-deep/10 rounded-2xl p-1 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)]">
            <TabsTrigger
              value="atendimento"
              className="flex-1 h-10 rounded-xl font-sans-editorial text-emerald-deep/70 data-[state=active]:bg-emerald-deep data-[state=active]:text-cream"
            >
              Solicitar Atendimento
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="flex-1 h-10 rounded-xl font-sans-editorial text-emerald-deep/70 data-[state=active]:bg-emerald-deep data-[state=active]:text-cream"
              onClick={() => navigate(tenant?.slug ? `/${tenant.slug}/cardapio` : "/cardapio")}
            >
              Cardápio
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 space-y-6 pb-32">
        {/* Status Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-deep/5 border border-gold">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="editorial-label text-emerald-deep">Conectado</span>
          </div>
        </div>

        {/* Table Display */}
        <div className="text-center space-y-2 py-4">
          <p className="editorial-label text-gold">Você está ocupando a</p>
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-5xl font-serif-editorial text-emerald-deep">Mesa</span>
            <span className="text-7xl font-serif-editorial text-gold leading-none">
              {tableNumber}
            </span>
          </div>
          <div className="mx-auto w-24 h-px bg-gold/60 mt-4" />
        </div>

        {/* Action Cards */}
        <div className="space-y-4 pt-4">
          {/* Call Waiter Card */}
          <button
            onClick={handleCallWaiter}
            disabled={isRequestActive || isCreatingCall}
            className="w-full p-5 rounded-2xl bg-emerald-deep text-cream border border-gold/40 flex items-center gap-4 hover:bg-emerald-deep/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_20px_40px_-15px_rgba(6,78,59,0.6)]"
          >
            <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold flex items-center justify-center flex-shrink-0">
              {isCreatingCall ? (
                <Loader2 className="h-7 w-7 text-gold animate-spin" />
              ) : (
                <Bell className="h-7 w-7 text-gold" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="editorial-label text-gold mb-0.5">Destaque</p>
              <h3 className="font-serif-editorial text-cream text-xl leading-tight">Solicitar Atendimento</h3>
              <p className="text-sm text-cream/70 font-sans-editorial">Chamar atendente na mesa</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gold" />
          </button>

          {/* Request Bill Card */}
          <button
            onClick={handleRequestBill}
            disabled={isRequestActive || isCreatingCall}
            className="w-full p-5 rounded-2xl bg-cream-soft border border-emerald-deep/10 flex items-center gap-4 hover:border-gold/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-deep/5 border border-emerald-deep/15 flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
              {isCreatingCall ? (
                <Loader2 className="h-7 w-7 text-emerald-deep animate-spin" />
              ) : (
                <Receipt className="h-7 w-7 text-emerald-deep" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-serif-editorial text-emerald-deep text-xl leading-tight">Pedir a Conta</h3>
              <p className="text-sm text-emerald-deep/60 font-sans-editorial">Fechar e realizar pagamento</p>
            </div>
            <ChevronRight className="h-5 w-5 text-emerald-deep/40 group-hover:text-gold transition-colors" />
          </button>
        </div>
      </div>

      {/* Active Request Bar */}
      {isRequestActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-deep border-t border-gold p-4 animate-fade-in z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-gold animate-pulse" />
              </div>
              <div>
                <p className="font-serif-editorial text-cream text-lg leading-tight">
                  {isWaiterCalled ? "Garçom a caminho..." : "Preparando sua conta..."}
                </p>
                <p className="text-xs text-cream/70 font-sans-editorial">Aguarde um momento</p>
              </div>
            </div>
            <button
              onClick={handleCancelRequest}
              disabled={isCancellingCall}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-sans-editorial text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
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
