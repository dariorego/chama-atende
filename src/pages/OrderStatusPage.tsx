import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, ChefHat, Timer, Check, Bell, FileEdit, Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOrderStatus, useQueuePosition } from "@/hooks/useOrderStatus";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const OrderStatusPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const locationState = location.state as { orderNumber?: number } | null;
  
  const { restaurant } = useAdminSettings();
  const { data: order, isLoading } = useOrderStatus(orderId);
  const { data: queueData } = useQueuePosition(orderId, restaurant?.id);

  const handleBack = () => {
    navigate("/pedido-cozinha");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <p className="text-emerald-deep/60 mb-4 font-sans-editorial">Pedido não encontrado</p>
        <Button onClick={handleBack} className="rounded-full bg-emerald-deep text-cream border border-gold/40 hover:bg-emerald-deep/90">Voltar ao início</Button>
      </div>
    );
  }

  const orderNumber = locationState?.orderNumber || order.order_number;
  const tableNumber = order.table_number || "N/A";
  const status = order.status || "pending";

  // Get first line item for display
  const lineItem = order.order_line_items?.[0];
  const itemName = lineItem?.item_name || "Pedido";
  const selections = lineItem?.order_line_item_selections || [];

  // Calculate progress and estimated time based on status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { progress: 25, label: "Na fila", icon: Timer };
      case "preparing":
        return { progress: 60, label: "Em preparo", icon: ChefHat };
      case "ready":
        return { progress: 90, label: "Pronto!", icon: Check };
      case "delivered":
        return { progress: 100, label: "Entregue", icon: Check };
      default:
        return { progress: 0, label: "Aguardando", icon: Timer };
    }
  };

  const statusInfo = getStatusInfo(status);
  const queuePosition = queueData?.position || null;
  const estimatedTime = queuePosition ? queuePosition * 5 : 10; // ~5 min per order

  // Build timeline based on order timestamps
  const getTimelineSteps = () => {
    const createdTime = order.created_at 
      ? new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : "--:--";

    const getPreparingStatus = (): "pending" | "active" | "completed" => {
      if (status === "pending") return "pending";
      if (status === "preparing") return "active";
      return "completed";
    };

    const getReadyStatus = (): "pending" | "active" | "completed" => {
      if (status === "ready") return "active";
      if (status === "delivered") return "completed";
      return "pending";
    };
    
    const steps = [
      {
        id: "confirmed",
        title: "Pedido Confirmado",
        description: `Enviado para cozinha às ${createdTime}`,
        status: "completed" as const,
      },
      {
        id: "preparing",
        title: "Em Preparo",
        description: order.preparing_at 
          ? `Iniciado às ${new Date(order.preparing_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : "O Chef está trabalhando no seu prato",
        status: getPreparingStatus(),
      },
      {
        id: "ready",
        title: "Pronto para entrega",
        description: order.ready_at
          ? `Finalizado às ${new Date(order.ready_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : "Aguardando finalização",
        status: getReadyStatus(),
      },
    ];
    
    return steps;
  };

  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-emerald-deep/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-soft border border-emerald-deep/15 text-emerald-deep hover:border-gold/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="editorial-label text-gold">Acompanhamento</p>
            <h1 className="text-xl font-serif-editorial text-emerald-deep leading-none mt-0.5">Status do pedido</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-soft border border-emerald-deep/15 text-emerald-deep hover:border-gold/40 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4">
        {/* Hero Section with Pulsing Icon */}
        <div className="flex flex-col items-center pt-10 pb-8">
          <div className={`w-24 h-24 rounded-full bg-cream-soft border border-gold flex items-center justify-center mb-6 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)] ${status === "preparing" ? "animate-pulse" : ""}`}>
            <statusInfo.icon className="w-12 h-12 text-gold" />
          </div>
          <p className="editorial-label text-gold mb-2">Etapa atual</p>
          <h1 className="text-4xl font-serif-editorial text-emerald-deep mb-3 leading-none">{statusInfo.label}</h1>
          <div className="w-16 h-px bg-gold/60 mb-3" />
          <p className="text-emerald-deep/70 text-center max-w-xs font-sans-editorial">
            {status === "pending" && "Seu pedido está na fila aguardando preparo."}
            {status === "preparing" && "Sua refeição está sendo preparada com cuidado pelo Chef."}
            {status === "ready" && "Seu pedido está pronto! Em breve será entregue."}
            {status === "delivered" && "Seu pedido foi entregue. Bom apetite!"}
          </p>
        </div>

        {/* Queue Card - Only show if pending or preparing */}
        {(status === "pending" || status === "preparing") && (
          <div className="bg-cream-soft rounded-2xl p-5 border border-emerald-deep/10 mb-6">
            <div className="flex justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="editorial-label text-emerald-deep/60">
                  {status === "pending" ? "Fila de Espera" : "Progresso"}
                </p>
                <p className="text-emerald-deep text-lg font-serif-editorial flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  {queuePosition 
                    ? `${queuePosition} pedido${queuePosition > 1 ? 's' : ''} à sua frente`
                    : "Processando..."
                  }
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="editorial-label text-emerald-deep/60">Progresso estimado</span>
                <span className="font-serif-editorial text-emerald-deep">~{estimatedTime} min</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2 bg-emerald-deep/10 [&>div]:bg-gold" />
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <p className="editorial-label text-gold">Percurso</p>
          <h3 className="text-2xl font-serif-editorial text-emerald-deep mb-4">Linha do tempo</h3>
          <div className="space-y-0">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === "completed"
                        ? "bg-emerald-deep border border-gold"
                        : step.status === "active"
                        ? "bg-gold/15 border-2 border-gold"
                        : "bg-cream-soft border border-emerald-deep/15"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <Check className="w-4 h-4 text-gold" />
                    ) : step.status === "active" ? (
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-emerald-deep/20" />
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        step.status === "completed" ? "bg-gold" : "bg-emerald-deep/15"
                      }`}
                    />
                  )}
                </div>

                {/* Timeline content */}
                <div className="flex-1 pb-6">
                  <p
                    className={`font-serif-editorial text-lg leading-tight ${
                      step.status === "pending"
                        ? "text-emerald-deep/40"
                        : "text-emerald-deep"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-emerald-deep/60 font-sans-editorial mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="editorial-label text-gold">Sua criação</p>
              <h3 className="text-2xl font-serif-editorial text-emerald-deep">Detalhes do pedido</h3>
            </div>
            <span className="text-xs font-sans-editorial text-emerald-deep bg-cream-soft border border-gold/40 px-2.5 py-1 rounded-full">
              #{orderNumber}
            </span>
          </div>

          <div className="space-y-3">
            {/* Main dish */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-cream-soft border border-emerald-deep/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-deep/5 border border-gold/40 flex items-center justify-center text-xs font-serif-editorial text-gold">
                {lineItem?.quantity || 1}x
              </div>
              <div className="flex-1">
                <p className="font-serif-editorial text-lg text-emerald-deep leading-tight">
                  {itemName} Personalizada
                </p>
                {selections.length > 0 && (
                  <p className="text-emerald-deep/60 text-xs mt-1 font-sans-editorial">
                    {selections.map((s) => s.option_name).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Location Badge */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-deep text-cream border border-gold/40">
          <Bell className="w-5 h-5 text-gold" />
          <span className="text-sm font-sans-editorial tracking-wide">
            Entrega na Mesa/Quarto {tableNumber}
          </span>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-lg border-t border-emerald-deep/10 p-4">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 h-12 gap-2 font-sans-editorial rounded-full bg-cream-soft border border-emerald-deep/15 text-emerald-deep hover:border-gold/40 hover:bg-cream-soft">
            <FileEdit className="w-5 h-5" />
            Observação
          </Button>
          <Button variant="secondary" className="flex-1 h-12 gap-2 font-sans-editorial rounded-full bg-emerald-deep text-cream border border-gold/40 hover:bg-emerald-deep/90">
            <Headphones className="w-5 h-5" />
            Solicitar Ajuda
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default OrderStatusPage;
