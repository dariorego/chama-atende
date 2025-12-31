import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, ChefHat, Timer, Check, Bell, FileEdit, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const baseNames: Record<string, string> = {
  tapioca: "Tapioca",
  crepioca: "Crepioca",
  omelete: "Omelete",
  waffle: "Waffle",
};

const ingredientNames: Record<string, string> = {
  mussarela: "Mussarela",
  parmesao: "Parmesão",
  coalho: "Queijo Coalho",
  cottage: "Cottage",
  presunto: "Presunto",
  peito_peru: "Peito de Peru",
  bacon: "Bacon",
  frango: "Frango Desfiado",
  tomate: "Tomate",
  rucula: "Rúcula",
  milho: "Milho",
  palmito: "Palmito",
  tradicional: "Molho Tradicional",
  especial: "Molho Especial",
  pimenta: "Pimenta",
  ervas: "Ervas Finas",
};

const OrderStatusPage = () => {
  const navigate = useNavigate();
  const { slug, baseId } = useParams<{ slug: string; baseId: string }>();
  const location = useLocation();
  const orderData = location.state as {
    base: string;
    tableNumber: string;
    observations: string;
    ingredients: { id: string; name: string; quantity?: number }[];
    orderNumber: number;
    submittedAt: string;
  } | null;

  const orderNumber = orderData?.orderNumber || Math.floor(1000 + Math.random() * 9000);
  const submittedAt = orderData?.submittedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const tableNumber = orderData?.tableNumber || "12";
  const baseName = baseNames[baseId || "tapioca"] || "Prato";
  const ingredients = orderData?.ingredients || [];

  const [queuePosition] = useState(3);
  const [estimatedTime] = useState(15);
  const [progressPercent] = useState(65);

  const timelineSteps = [
    {
      id: "confirmed",
      title: "Pedido Confirmado",
      description: `Enviado para cozinha às ${submittedAt}`,
      status: "completed" as const,
    },
    {
      id: "preparing",
      title: "Em Preparo",
      description: "O Chef está trabalhando no seu prato",
      status: "active" as const,
    },
    {
      id: "ready",
      title: "Pronto para entrega",
      description: "Aguardando finalização",
      status: "pending" as const,
    },
  ];

  const handleBack = () => {
    navigate(`/${slug}/pedido-cozinha`);
  };

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
          <div className="w-24 h-24 rounded-full bg-card border-2 border-primary flex items-center justify-center mb-6 animate-pulse-ring">
            <ChefHat className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-[28px] font-bold text-foreground mb-2">Em preparo</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            Sua refeição está sendo preparada com cuidado pelo Chef.
          </p>
        </div>

        {/* Queue Card */}
        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-foreground">Fila de Espera</p>
              <p className="text-primary text-sm font-medium flex items-center gap-1">
                <Timer className="w-4 h-4" />
                {queuePosition} pedidos à sua frente
              </p>
            </div>
            <div
              className="w-20 h-20 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop')",
              }}
            />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progresso da fila</span>
              <span className="font-bold text-foreground">~{estimatedTime} min</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

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
                1x
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">
                  {baseName} Personalizada
                </p>
                {ingredients.length > 0 && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {ingredients.map((ing) => ingredientNames[ing.id] || ing.name || ing.id).join(", ")}
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
            Entrega no Quarto {tableNumber}
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
