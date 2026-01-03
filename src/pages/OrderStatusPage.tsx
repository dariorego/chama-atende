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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
        <Button onClick={handleBack}>Voltar ao início</Button>
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
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Status do Pedido</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <MoreHorizontal className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4">
        {/* Hero Section with Pulsing Icon */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className={`w-24 h-24 rounded-full bg-card border-2 ${status === "ready" || status === "delivered" ? "border-green-500" : "border-primary"} flex items-center justify-center mb-6 ${status === "preparing" ? "animate-pulse" : ""}`}>
            <statusInfo.icon className={`w-12 h-12 ${status === "ready" || status === "delivered" ? "text-green-500" : "text-primary"}`} />
          </div>
          <h1 className="text-[28px] font-bold text-foreground mb-2">{statusInfo.label}</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            {status === "pending" && "Seu pedido está na fila aguardando preparo."}
            {status === "preparing" && "Sua refeição está sendo preparada com cuidado pelo Chef."}
            {status === "ready" && "Seu pedido está pronto! Em breve será entregue."}
            {status === "delivered" && "Seu pedido foi entregue. Bom apetite!"}
          </p>
        </div>

        {/* Queue Card - Only show if pending or preparing */}
        {(status === "pending" || status === "preparing") && (
          <div className="bg-card rounded-xl p-5 border border-border mb-6">
            <div className="flex justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold text-foreground">
                  {status === "pending" ? "Fila de Espera" : "Progresso"}
                </p>
                <p className="text-primary text-sm font-medium flex items-center gap-1">
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
                <span className="text-muted-foreground">Progresso estimado</span>
                <span className="font-bold text-foreground">~{estimatedTime} min</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2" />
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Linha do Tempo</h3>
          <div className="space-y-0">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === "completed"
                        ? "bg-primary"
                        : step.status === "active"
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted border-2 border-border"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : step.status === "active" ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        step.status === "completed" ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                {/* Timeline content */}
                <div className="flex-1 pb-6">
                  <p
                    className={`font-semibold ${
                      step.status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Detalhes do Pedido</h3>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              #{orderNumber}
            </span>
          </div>

          <div className="space-y-3">
            {/* Main dish */}
            <div className="flex items-start gap-4 p-3 rounded-lg bg-card border border-border">
              <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {lineItem?.quantity || 1}x
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">
                  {itemName} Personalizada
                </p>
                {selections.length > 0 && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {selections.map((s) => s.option_name).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Location Badge */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <Bell className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Entrega na Mesa/Quarto {tableNumber}
          </span>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 h-12 gap-2 font-semibold">
            <FileEdit className="w-5 h-5" />
            Observação
          </Button>
          <Button variant="secondary" className="flex-1 h-12 gap-2 font-semibold">
            <Headphones className="w-5 h-5" />
            Solicitar Ajuda
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default OrderStatusPage;
