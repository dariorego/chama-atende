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
import { useTenant } from "@/hooks/useTenant";
import { IDENTIFICATION_CONFIG, IdentificationType } from "@/types/restaurant";

interface LocationState {
  orderItemId: string;
  orderItemName: string;
  selections: OrderSelection[];
  notes: string;
}

const OrderReviewPage = () => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
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
    navigate(tenant?.slug ? `/${tenant.slug}` : "/");
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
      navigate(tenant?.slug ? `/${tenant.slug}/pedido-cozinha/status/${result.orderId}` : `/pedido-cozinha/status/${result.orderId}`, {
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
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-emerald-deep/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-soft border border-emerald-deep/15 text-emerald-deep"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="editorial-label text-gold">Etapa final</p>
            <h1 className="text-xl font-serif-editorial text-emerald-deep leading-none mt-0.5">Revisão do pedido</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-soft border border-emerald-deep/15 text-emerald-deep">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Indicator - 4 bars, step 3 active */}
      <div className="flex gap-2 px-4 py-6">
        <div className="flex-1 h-1 rounded-full bg-emerald-deep/60" />
        <div className="flex-1 h-1 rounded-full bg-emerald-deep/60" />
        <div className="flex-1 h-1 rounded-full bg-gold shadow-[0_0_12px_rgba(201,168,76,0.6)]" />
        <div className="flex-1 h-1 rounded-full bg-emerald-deep/15" />
      </div>

      <div className="px-4">
        {/* Section Title */}
        <div className="mb-5">
          <p className="editorial-label text-gold">Personalização</p>
          <h2 className="text-3xl font-serif-editorial text-emerald-deep leading-tight">Sua criação</h2>
          <p className="text-emerald-deep/60 text-sm font-sans-editorial mt-1">
            Confira os detalhes antes de enviar para a cozinha.
          </p>
        </div>

        {/* Main Dish Card */}
        <div className="bg-cream-soft rounded-2xl p-5 border border-emerald-deep/10 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="editorial-label text-emerald-deep/60 mb-1">Prato base</p>
              <p className="text-2xl font-serif-editorial text-emerald-deep leading-tight">{itemName} Personalizada</p>
              {additionalTotal > 0 && (
                <p className="text-gold text-sm font-sans-editorial mt-2">
                  +R$ {additionalTotal.toFixed(2)} em adicionais
                </p>
              )}
            </div>
            {orderItem?.image_url && (
              <div
                className="w-24 h-24 bg-cover bg-center rounded-xl border border-gold/40"
                style={{ backgroundImage: `url(${orderItem.image_url})` }}
              />
            )}
          </div>
        </div>

        {/* Selected Ingredients */}
        <div className="mb-6">
          <h3 className="editorial-label text-emerald-deep/70 mb-3">Ingredientes selecionados</h3>
          <div className="space-y-2">
            {selections.length > 0 ? (
              selections.map((selection) => (
                <div
                  key={selection.optionId}
                  className="flex items-center gap-3 p-4 rounded-xl bg-cream-soft border border-emerald-deep/10"
                >
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="text-base font-serif-editorial text-emerald-deep flex-1">
                    {selection.optionName}
                    {selection.quantity > 1 && (
                      <span className="text-emerald-deep/50 ml-1 font-sans-editorial">x{selection.quantity}</span>
                    )}
                  </span>
                  {selection.additionalPrice > 0 && (
                    <span className="text-sm text-gold font-sans-editorial">
                      +R$ {(selection.additionalPrice * selection.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-emerald-deep/60 text-sm font-sans-editorial">Nenhum ingrediente selecionado</p>
            )}
          </div>
        </div>

        {/* Observations */}
        <div className="mb-6">
          <h3 className="editorial-label text-emerald-deep/70 mb-2">Observações</h3>
          <div className="relative">
            <Textarea
              placeholder="Ex: Bem passado, sem sal, extra crocante..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[100px] resize-none pr-10 bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
            />
            <FileEdit className="absolute bottom-3 right-3 w-4 h-4 text-emerald-deep/40" />
          </div>
        </div>

        {/* Customer Name */}
        <div className="mb-6">
          <h3 className="editorial-label text-emerald-deep/70 mb-2">Seu nome</h3>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-deep/50" />
            <Input
              placeholder="Como podemos chamar você?"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-12 h-14 text-base bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
            />
          </div>
        </div>

        {/* Identification (Mesa/Quarto/Telefone) */}
        <div className="mb-6">
          <h3 className="editorial-label text-emerald-deep/70 mb-2">{idConfig.label}</h3>
          <div className="relative">
            <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-deep/50" />
            <Input
              placeholder={idConfig.placeholder}
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              className="pl-12 h-14 text-base bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
            />
          </div>
          <p className="text-xs text-emerald-deep/60 mt-2 ml-1 font-sans-editorial">
            {idConfig.helpText}
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-sm border-t border-emerald-deep/10 p-4">
        <Button
          onClick={handleSubmit}
          disabled={submitOrder.isPending}
          className="w-full h-14 rounded-full text-base font-sans-editorial gap-2 bg-emerald-deep text-cream border border-gold/40 hover:bg-emerald-deep/90 tracking-wide shadow-[0_20px_40px_-15px_rgba(6,78,59,0.6)]"
        >
          {submitOrder.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar pedido
              <Send className="w-5 h-5" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
};

export default OrderReviewPage;
