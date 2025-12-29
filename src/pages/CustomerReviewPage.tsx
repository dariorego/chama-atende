import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Store, HeadphonesIcon, UtensilsCrossed, FileEdit, User, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const getRatingLabel = (rating: number) => {
  switch (rating) {
    case 5: return { label: "Excelente", isPrimary: true };
    case 4: return { label: "Muito Bom", isPrimary: true };
    case 3: return { label: "Bom", isPrimary: false };
    case 2: return { label: "Regular", isPrimary: false };
    case 1: return { label: "Ruim", isPrimary: false };
    default: return { label: "Avalie", isPrimary: false };
  }
};

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating = ({ rating, onRatingChange }: StarRatingProps) => (
  <div className="flex justify-between items-center px-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onRatingChange(star)}
        className="p-1 transition-transform hover:scale-110 active:scale-95"
        type="button"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            star <= rating
              ? "text-[#FFB400] fill-[#FFB400]"
              : "text-muted-foreground"
          }`}
        />
      </button>
    ))}
  </div>
);

interface RatingCardProps {
  icon: React.ReactNode;
  title: string;
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RatingCard = ({ icon, title, rating, onRatingChange }: RatingCardProps) => {
  const { label, isPrimary } = getRatingLabel(rating);
  
  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-bold text-base">{title}</span>
        </div>
        <Badge 
          variant={isPrimary ? "default" : "secondary"}
          className={isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
        >
          {label}
        </Badge>
      </div>
      <StarRating rating={rating} onRatingChange={onRatingChange} />
    </div>
  );
};

const CustomerReviewPage = () => {
  const navigate = useNavigate();
  
  const [ambienteRating, setAmbienteRating] = useState(0);
  const [atendimentoRating, setAtendimentoRating] = useState(0);
  const [comidaRating, setComidaRating] = useState(0);
  const [observations, setObservations] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    // Simular envio
    toast({
      title: "Avaliação enviada!",
      description: "Obrigado por compartilhar sua experiência conosco.",
    });

    // Navegar de volta após envio
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const isFormValid = fullName.trim().length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Avaliação do Cliente</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Intro text */}
        <p className="text-muted-foreground text-sm text-center">
          Compartilhe sua experiência conosco. Sua opinião ajuda a melhorarmos nosso serviço.
        </p>

        {/* Rating Cards */}
        <div className="space-y-4">
          <RatingCard
            icon={<Store className="w-5 h-5 text-primary" />}
            title="Ambiente"
            rating={ambienteRating}
            onRatingChange={setAmbienteRating}
          />
          
          <RatingCard
            icon={<HeadphonesIcon className="w-5 h-5 text-primary" />}
            title="Atendimento"
            rating={atendimentoRating}
            onRatingChange={setAtendimentoRating}
          />
          
          <RatingCard
            icon={<UtensilsCrossed className="w-5 h-5 text-primary" />}
            title="Comida"
            rating={comidaRating}
            onRatingChange={setComidaRating}
          />
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Observações</label>
          <div className="relative">
            <Textarea
              placeholder="Conte-nos mais detalhes sobre sua visita..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[120px] resize-none pr-10 bg-card border-border"
              rows={4}
            />
            <FileEdit className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Personal Data */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Seus Dados</h3>
          
          {/* Full Name (required) */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Nome completo *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>
          
          {/* Phone (optional) */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Telefone (Opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20"
          disabled={!isFormValid}
        >
          Enviar Avaliação
          <Send className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
};

export default CustomerReviewPage;
