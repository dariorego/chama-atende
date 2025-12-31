import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react";

interface BaseOption {
  id: string;
  name: string;
  description: string;
  image: string;
  tags: { label: string; type: "positive" | "neutral" | "warning" }[];
}

const baseOptions: BaseOption[] = [
  {
    id: "tapioca",
    name: "Tapioca",
    description: "Goma de mandioca hidratada peneirada e preparada na hora.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop",
    tags: [
      { label: "Sem Glúten", type: "positive" },
      { label: "Vegano", type: "positive" }
    ]
  },
  {
    id: "crepioca",
    name: "Crepioca",
    description: "Massa leve e nutritiva de tapioca batida com ovo fresco.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
    tags: [
      { label: "Sem Glúten", type: "positive" },
      { label: "Proteico", type: "neutral" }
    ]
  },
  {
    id: "omelete",
    name: "Omelete",
    description: "Ovos frescos batidos, preparados na chapa com manteiga.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop",
    tags: [
      { label: "Low Carb", type: "neutral" },
      { label: "Vegetariano", type: "positive" }
    ]
  },
  {
    id: "waffle",
    name: "Waffle",
    description: "Massa crocante por fora e macia por dentro, feita na hora.",
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=400&fit=crop",
    tags: [
      { label: "Contém Glúten", type: "warning" }
    ]
  }
];

const tagStyles = {
  positive: "bg-primary/20 text-primary",
  neutral: "bg-blue-400/20 text-blue-300",
  warning: "bg-orange-400/20 text-orange-300"
};

const stepLabels: Record<number, string> = {
  1: "Escolha a base",
  2: "Selecione ingredientes",
  3: "Revise seu pedido"
};

const KitchenOrderPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [currentStep] = useState(1);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/${slug}`);
  };

  const handleSelectBase = (baseId: string) => {
    setSelectedBase(baseId);
    navigate(`/${slug}/pedido-cozinha/${baseId}`);
  };

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

        {/* Base Options */}
        <div className="space-y-3">
          {baseOptions.map((option) => (
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
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={option.image}
                  alt={option.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {option.name}
                  </h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {option.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${tagStyles[tag.type]}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer Progress Indicator */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-4 safe-area-bottom">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? "w-8 bg-primary" : "w-1.5 bg-muted"}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? "w-8 bg-primary" : "w-1.5 bg-muted"}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? "w-8 bg-primary" : "w-1.5 bg-muted"}`} />
        </div>
        <p className="text-center text-xs text-muted-foreground font-medium">
          Passo {currentStep} de 3: {stepLabels[currentStep]}
        </p>
      </footer>
    </div>
  );
};

export default KitchenOrderPage;
