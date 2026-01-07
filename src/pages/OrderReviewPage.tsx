import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, HelpCircle, CheckCircle, FileEdit, MapPin, Send, Loader2, User, Bed, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSubmitOrder, OrderSelection } from "@/hooks/useSubmitOrder";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useClientOrderItem } from "@/hooks/useClientItemCombinations";
import { useTableContext } from "@/hooks/useTableContext";
import { IDENTIFICATION_CONFIG, IdentificationType } from "@/types/restaurant";

interface LocationState {
  orderItemId: string;
  orderItemName: string;
  selections: OrderSelection[];
  notes: string;
}

const OrderReviewPage = () => {
  const navigate = useNavigate();
  const { baseId } = useParams<{ baseId: string }>();
  const location = useLocation();
  const orderData = location.state as LocationState | null;

  const { restaurant } = useAdminSettings();
  const { data: orderItem } = useClientOrderItem(baseId);
  const { tableNumber } = useTableContext();
  const submitOrder = useSubmitOrder();

  const [observations, setObservations] = useState(orderData?.notes || "");
  const [customerName, setCustomerName] = useState("");
  const [identification, setIdentification] = useState("");

  const identificationType: IdentificationType = restaurant?.identification_type || 'table';
  const idConfig = IDENTIFICATION_CONFIG[identificationType];

  // Pre-fill identification with table number if available and type is 'table'
  useEffect(() => {
    if (tableNumber && identificationType === 'table' && !identification) {
      setIdentification(tableNumber.toString());
    }
  }, [tableNumber, identificationType, identification]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }

    if (!identification.trim()) {
      toast.error(`Por favor, informe ${idConfig.label.toLowerCase()}`);
      return;
    }

    if (!restaurant?.id || !baseId) {
      toast.error("Erro ao identificar restaurante");
      return;
    }

    try {
      const result = await submitOrder.mutateAsync({
        restaurantId: restaurant.id,
        orderItemId: baseId,
        orderItemName: orderData?.orderItemName || orderItem?.name || "Pedido",
        customerName: customerName.trim(),
        tableNumber: identification.trim(),
        observations: observations.trim() || undefined,
        selections: orderData?.selections || [],
      });

      toast.success("Pedido enviado com sucesso!");
      navigate(`/pedido-cozinha/status/${result.orderId}`, {
        state: { orderNumber: result.orderNumber },
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const itemName = orderData?.orderItemName || orderItem?.name || "Prato";
  const selections = orderData?.selections || [];

  // Calculate total additional price
  const additionalTotal = selections.reduce(
    (sum, s) => sum + (s.additionalPrice * s.quantity),
    0
  );

  // Icon based on identification type
  const IdentificationIcon = identificationType === 'table' 
    ? MapPin 
    : identificationType === 'room' 
      ? Bed 
      : Smartphone;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Revisão do Pedido</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Indicator - 4 bars, step 3 active */}
      <div className="flex gap-2 px-4 py-6">
        <div className="flex-1 h-1.5 rounded-full bg-primary/60" />
        <div className="flex-1 h-1.5 rounded-full bg-primary/60" />
        <div className="flex-1 h-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
        <div className="flex-1 h-1.5 rounded-full bg-muted" />
      </div>

      <div className="px-4">
        {/* Section Title */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Sua Criação</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Confira os detalhes antes de enviar para a cozinha.
          </p>
        </div>

        {/* Main Dish Card */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xl font-bold">{itemName} Personalizada</p>
              {additionalTotal > 0 && (
                <p className="text-primary text-sm font-medium mt-1">
                  +R$ {additionalTotal.toFixed(2)} em adicionais
                </p>
              )}
            </div>
            {orderItem?.image_url && (
              <div
                className="w-24 h-24 bg-cover bg-center rounded-xl border border-border"
                style={{ backgroundImage: `url(${orderItem.image_url})` }}
              />
            )}
          </div>
        </div>

        {/* Selected Ingredients */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Ingredientes Selecionados</h3>
          <div className="space-y-2">
            {selections.length > 0 ? (
              selections.map((selection) => (
                <div
                  key={selection.optionId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base font-medium flex-1">
                    {selection.optionName}
                    {selection.quantity > 1 && (
                      <span className="text-muted-foreground ml-1">x{selection.quantity}</span>
                    )}
                  </span>
                  {selection.additionalPrice > 0 && (
                    <span className="text-sm text-primary">
                      +R$ {(selection.additionalPrice * selection.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum ingrediente selecionado</p>
            )}
          </div>
        </div>

        {/* Observations */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Observações</h3>
          <div className="relative">
            <Textarea
              placeholder="Ex: Bem passado, sem sal, extra crocante..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[100px] resize-none pr-10 bg-surface placeholder:text-surface-foreground border-border rounded-xl"
            />
            <FileEdit className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Customer Name */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Seu Nome</h3>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Como podemos chamar você?"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-12 h-14 text-base bg-surface placeholder:text-surface-foreground border-border rounded-xl"
            />
          </div>
        </div>

        {/* Identification (Mesa/Quarto/Telefone) */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">{idConfig.label}</h3>
          <div className="relative">
            <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={idConfig.placeholder}
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              className="pl-12 h-14 text-base bg-surface placeholder:text-surface-foreground border-border rounded-xl"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            {idConfig.helpText}
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <Button
          onClick={handleSubmit}
          disabled={submitOrder.isPending}
          className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
        >
          {submitOrder.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              ENVIAR PEDIDO
              <Send className="w-5 h-5" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
};

export default OrderReviewPage;
