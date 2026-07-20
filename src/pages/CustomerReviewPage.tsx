import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Store, HeadphonesIcon, UtensilsCrossed, FileEdit, User, Phone, Send, Share2, MoreHorizontal, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useSubmitReview } from "@/hooks/useAdminReviews";
import { useTenant } from "@/hooks/useTenant";

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
              ? "text-gold fill-gold"
              : "text-emerald-deep/25"
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
    <div className="bg-cream-soft rounded-2xl p-5 border border-emerald-deep/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-deep/5 border border-gold/40 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-serif-editorial text-xl text-emerald-deep">{title}</span>
        </div>
        <Badge 
          variant={isPrimary ? "default" : "secondary"}
          className={isPrimary ? "bg-emerald-deep text-cream border border-gold/40 font-sans-editorial" : "bg-emerald-deep/10 text-emerald-deep font-sans-editorial"}
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
  const { tenant } = useTenant();
  
  
  const [ambienteRating, setAmbienteRating] = useState(0);
  const [atendimentoRating, setAtendimentoRating] = useState(0);
  const [comidaRating, setComidaRating] = useState(0);
  const [observations, setObservations] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const { restaurant, isLoading } = useAdminSettings();
  const submitReview = useSubmitReview();

  const handleBack = () => {
    navigate(tenant?.slug ? `/${tenant.slug}` : '/');
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    if (!restaurant) return;

    try {
      await submitReview.mutateAsync({
        restaurant_id: restaurant.id,
        customer_name: fullName.trim(),
        phone: phone || null,
        ambiente_rating: ambienteRating || null,
        atendimento_rating: atendimentoRating || null,
        comida_rating: comidaRating || null,
        observations: observations || null,
      });

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por compartilhar sua experiência conosco.",
      });

      setTimeout(() => {
        navigate(tenant?.slug ? `/${tenant.slug}` : '/');
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = fullName.trim().length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
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
          src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-emerald-deep/40 to-emerald-deep/20" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={handleBack}
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
          <p className="editorial-label text-gold mb-2">Sua experiência</p>
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

      {/* Title Tab */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="w-full h-12 bg-cream-soft border border-emerald-deep/10 rounded-2xl p-1 flex items-center justify-center shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)]">
          <span className="editorial-label text-emerald-deep">Avaliação do cliente</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 pb-28 space-y-6">
        {/* Intro */}
        <div className="text-center">
          <p className="editorial-label text-gold">Nos conte tudo</p>
          <h2 className="text-3xl font-serif-editorial text-emerald-deep leading-tight mt-1">Como foi sua visita?</h2>
          <p className="text-emerald-deep/60 text-sm font-sans-editorial mt-2 max-w-xs mx-auto">
            Sua opinião ajuda a refinarmos cada detalhe da experiência.
          </p>
          <div className="mx-auto w-16 h-px bg-gold/60 mt-4" />
        </div>

        {/* Rating Cards */}
        <div className="space-y-4">
          <RatingCard
            icon={<Store className="w-5 h-5 text-gold" />}
            title="Ambiente"
            rating={ambienteRating}
            onRatingChange={setAmbienteRating}
          />
          
          <RatingCard
            icon={<HeadphonesIcon className="w-5 h-5 text-gold" />}
            title="Atendimento"
            rating={atendimentoRating}
            onRatingChange={setAtendimentoRating}
          />
          
          <RatingCard
            icon={<UtensilsCrossed className="w-5 h-5 text-gold" />}
            title="Comida"
            rating={comidaRating}
            onRatingChange={setComidaRating}
          />
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="editorial-label text-emerald-deep/70">Observações</label>
          <div className="relative">
            <Textarea
              placeholder="Conte-nos mais detalhes sobre sua visita..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="min-h-[120px] resize-none pr-10 bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
              rows={4}
            />
            <FileEdit className="absolute bottom-3 right-3 w-4 h-4 text-emerald-deep/40 pointer-events-none" />
          </div>
        </div>

        {/* Personal Data */}
        <div className="space-y-4">
          <h3 className="editorial-label text-emerald-deep/70">Seus dados</h3>
          
          {/* Full Name (required) */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-deep/50" />
            <Input
              placeholder="Nome completo *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-12 h-14 bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
            />
          </div>
          
          {/* Phone (optional) */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-deep/50" />
            <Input
              placeholder="Telefone (Opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-12 h-14 bg-cream-soft border-emerald-deep/15 text-emerald-deep placeholder:text-emerald-deep/40 focus:ring-2 focus:ring-gold rounded-2xl"
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-lg border-t border-emerald-deep/10 p-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 rounded-full text-base font-sans-editorial gap-2 bg-emerald-deep text-cream border border-gold/40 hover:bg-emerald-deep/90 shadow-[0_20px_40px_-15px_rgba(6,78,59,0.6)]"
          disabled={!isFormValid || submitReview.isPending}
        >
          {submitReview.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar Avaliação
              <Send className="w-5 h-5" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
};

export default CustomerReviewPage;
