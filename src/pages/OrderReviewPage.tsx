import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, HelpCircle, CheckCircle, FileEdit, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const baseNames: Record<string, string> = {
  tapioca: "Tapioca",
  crepioca: "Crepioca",
  omelete: "Omelete",
  waffle: "Waffle",
};

const baseImages: Record<string, string> = {
  tapioca: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
  crepioca: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop",
  omelete: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop",
  waffle: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&h=200&fit=crop",
};

const ingredientNames: Record<string, string> = {
  mozzarella: "Mozzarella Fresca",
  cheddar: "Cheddar Maturado",
  feta: "Queijo Feta",
  gouda: "Gouda Defumado",
  ham: "Presunto Defumado",
  bacon: "Bacon Crocante",
  turkey: "Peru Assado",
  chicken: "Frango Grelhado",
  spinach: "Espinafre",
  mushrooms: "Cogumelos",
  tomatoes: "Tomates",
  onions: "Cebola Roxa",
  peppers: "Pimentões",
  olives: "Azeitonas",
  pesto: "Pesto de Manjericão",
  chipotle: "Chipotle Defumado",
  garlic: "Alho Tostado",
  honey: "Mel e Mostarda",
};

const OrderReviewPage = () => {
  const navigate = useNavigate();
  const { baseId } = useParams<{ baseId: string }>();
  const location = useLocation();
  const orderData = location.state as {
    base: string;
    cheeses: string[];
    proteins: Record<string, number>;
    vegetables: string[];
    sauces: string[];
    notes: string;
  } | null;

  const [observations, setObservations] = useState(orderData?.notes || "");
  const [tableNumber, setTableNumber] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    navigate(`/pedido-cozinha/${baseId}/status`, {
      state: {
        base: baseId,
        tableNumber,
        observations,
        ingredients: allIngredients,
        orderNumber: Math.floor(1000 + Math.random() * 9000),
        submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }
    });
  };

  const baseName = baseNames[baseId || ""] || "Prato";
  const baseImage = baseImages[baseId || ""] || baseImages.omelete;

  // Collect all selected ingredients
  const allIngredients: { id: string; name: string; quantity?: number }[] = [];
  
  if (orderData) {
    orderData.cheeses.forEach((id) => {
      allIngredients.push({ id, name: ingredientNames[id] || id });
    });
    
    Object.entries(orderData.proteins).forEach(([id, qty]) => {
      if (qty > 0) {
        allIngredients.push({ id, name: ingredientNames[id] || id, quantity: qty });
      }
    });
    
    orderData.vegetables.forEach((id) => {
      allIngredients.push({ id, name: ingredientNames[id] || id });
    });
    
    orderData.sauces.forEach((id) => {
      allIngredients.push({ id, name: ingredientNames[id] || id });
    });
  }

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
              <p className="text-xl font-bold">{baseName} Personalizada</p>
              <p className="text-primary text-sm font-medium mt-1">Base de 3 Ovos</p>
            </div>
            <div
              className="w-24 h-24 bg-cover bg-center rounded-xl border border-border"
              style={{ backgroundImage: `url(${baseImage})` }}
            />
          </div>
        </div>

        {/* Selected Ingredients */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Ingredientes Selecionados</h3>
          <div className="space-y-2">
            {allIngredients.length > 0 ? (
              allIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base font-medium flex-1">
                    {ingredient.name}
                    {ingredient.quantity && ingredient.quantity > 1 && (
                      <span className="text-muted-foreground ml-1">x{ingredient.quantity}</span>
                    )}
                  </span>
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
              className="min-h-[100px] resize-none pr-10 bg-card border-border rounded-xl"
            />
            <FileEdit className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Identification */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Identificação</h3>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Número da Mesa ou Quarto"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="pl-12 h-14 text-base bg-card border-border rounded-xl"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Usaremos esta informação para entregar seu pedido.
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
        >
          ENVIAR PEDIDO
          <Send className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
};

export default OrderReviewPage;
