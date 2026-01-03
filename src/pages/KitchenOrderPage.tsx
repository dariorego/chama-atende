import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, HelpCircle, Loader2, CameraOff } from "lucide-react";
import { useClientOrderItems, OrderItemTag } from "@/hooks/useClientOrderItems";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const tagStyles: Record<string, string> = {
  positive: "bg-primary/20 text-primary",
  neutral: "bg-blue-400/20 text-blue-300",
  warning: "bg-orange-400/20 text-orange-300",
};

const KitchenOrderPage = () => {
  const navigate = useNavigate();
  const { restaurant } = useAdminSettings();
  const { data: orderItems, isLoading } = useClientOrderItems(restaurant?.id);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);

  const handleBack = () => {
    navigate("/");
  };

  const handleSelectBase = (baseId: string) => {
    setSelectedBase(baseId);
    navigate(`/pedido-cozinha/${baseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Café da Manhã
        </h2>
        <button className="flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
          <HelpCircle className="h-4 w-4" />
          Ajuda
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Vamos começar?
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Selecione a base do seu prato para personalizar os ingredientes.
          </p>
        </div>

        {/* Empty State */}
        {(!orderItems || orderItems.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum item disponível no momento.
            </p>
          </div>
        )}

        {/* Base Options */}
        <div className="space-y-3">
          {orderItems?.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectBase(option.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 group ${
                selectedBase === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card"
              }`}
            >
              {/* Image */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                {option.image_url ? (
                  <img
                    src={option.image_url}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CameraOff className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {option.name}
                </h3>
                {option.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {option.description}
                  </p>
                )}
                {/* Tags */}
                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {option.tags.map((tag: OrderItemTag, index: number) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tagStyles[tag.type] || tagStyles.neutral
                        }`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer Progress */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-primary" />
            <div className="flex-1 h-1.5 rounded-full bg-muted" />
            <div className="flex-1 h-1.5 rounded-full bg-muted" />
          </div>
          <span className="text-xs text-muted-foreground font-medium ml-2">
            Passo 1 de 3 • Escolha a base
          </span>
        </div>
      </footer>
    </div>
  );
};

export default KitchenOrderPage;
