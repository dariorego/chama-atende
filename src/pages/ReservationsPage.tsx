import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Check,
  Minus,
  Plus,
  CalendarDays,
  Sparkles,
  ArrowLeft,
  Share2,
  MoreHorizontal,
  MapPin,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

const ReservationsPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [observation, setObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [observationFocused, setObservationFocused] = useState(false);
  const { toast } = useToast();

  const establishment = {
    name: "Bistro Verde",
    location: "Jardins, São Paulo",
    rating: 4.8,
    reviewCount: 324,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !name || !phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: "Reserva confirmada!",
      description: "Você receberá uma confirmação por WhatsApp",
    });
  };

  const decrementPartySize = () => {
    if (partySize > 1) setPartySize(partySize - 1);
  };

  const incrementPartySize = () => {
    if (partySize < 20) setPartySize(partySize + 1);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative h-80">
          <img
            src={establishment.image}
            alt={establishment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          {/* Floating buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
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
            {/* Open badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Aberto agora</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">{establishment.name}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{establishment.location}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-white">{establishment.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-8">
          <div className="flex flex-col items-center justify-center animate-scale-in">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 bg-primary text-background text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-bounce">
                <Sparkles className="w-3 h-3" />
                Confirmada!
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reserva Confirmada!
            </h2>
            <p className="text-muted-foreground text-center max-w-xs mb-8">
              Sua mesa foi reservada. Enviaremos uma confirmação por WhatsApp.
            </p>

            {/* Details Card */}
            <div className="w-full max-w-sm p-6 bg-surface-dark rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Detalhes da Reserva</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-foreground font-medium">
                    {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="text-foreground font-medium">{time}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Pessoas</span>
                  <span className="text-foreground font-medium">{partySize} {partySize === 1 ? "pessoa" : "pessoas"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="text-foreground font-medium">{name}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setDate(undefined);
                setTime(undefined);
                setPartySize(2);
                setName("");
                setPhone("");
                setObservation("");
              }}
              className="mt-6 rounded-full px-8"
            >
              Nova Reserva
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-80">
        <img
          src={establishment.image}
          alt={establishment.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
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
          {/* Open badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Aberto agora</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">{establishment.name}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{establishment.location}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">{establishment.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title Tab */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="w-full h-12 bg-surface-dark/80 backdrop-blur-sm rounded-2xl p-1 flex items-center justify-center">
          <span className="text-foreground font-semibold">Fazer Reserva</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 pb-32 space-y-6">
        {/* Section: Date */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Escolha uma data</h2>
          <div className="bg-surface-dark rounded-2xl p-4 border border-border/30">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              locale={ptBR}
              className="w-full pointer-events-auto"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-base font-semibold text-foreground",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-9 w-9 bg-white/10 hover:bg-white/20 rounded-full p-0 opacity-70 hover:opacity-100 transition-all inline-flex items-center justify-center"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex justify-between",
                head_cell: "text-muted-foreground rounded-md w-10 font-medium text-xs uppercase",
                row: "flex w-full mt-2 justify-between",
                cell: cn(
                  "h-10 w-10 text-center text-sm p-0 relative",
                  "[&:has([aria-selected])]:bg-transparent"
                ),
                day: cn(
                  "h-10 w-10 p-0 font-normal rounded-full transition-all",
                  "hover:bg-white/10 focus:bg-white/10",
                  "aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected: cn(
                  "bg-primary text-primary-foreground font-semibold",
                  "hover:bg-primary hover:text-primary-foreground",
                  "focus:bg-primary focus:text-primary-foreground",
                  "shadow-lg shadow-primary/30"
                ),
                day_today: "bg-white/10 text-foreground font-semibold",
                day_outside: "day-outside text-muted-foreground opacity-30",
                day_disabled: "text-muted-foreground opacity-30",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {/* Section: Time Pills */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Horário Disponível</h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 w-max">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "px-5 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    time === slot
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-surface-dark text-foreground hover:bg-white/10 border border-border/30"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Party Size Counter */}
        <div className="space-y-3">
          <div className="bg-surface-dark rounded-2xl p-5 border border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Quantas pessoas?</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mesas acima de 8 pessoas requerem confirmação.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementPartySize}
                  disabled={partySize <= 1}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    partySize <= 1
                      ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                      : "bg-white/10 text-foreground hover:bg-white/20 active:scale-95"
                  )}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-foreground w-8 text-center">
                  {partySize}
                </span>
                <button
                  type="button"
                  onClick={incrementPartySize}
                  disabled={partySize >= 20}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    partySize >= 20
                      ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/30"
                  )}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: User Data */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Seus dados</h2>
          
          {/* Name Input */}
          <div className="relative">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              nameFocused ? "text-primary" : "text-muted-foreground"
            )}>
              <User className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              className="h-14 pl-12 bg-surface-dark border-border/30 rounded-xl text-base text-muted-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Phone Input */}
          <div className="relative">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              phoneFocused ? "text-primary" : "text-muted-foreground"
            )}>
              <Phone className="w-5 h-5" />
            </div>
            <Input
              type="tel"
              placeholder="Telefone (WhatsApp)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              className="h-14 pl-12 bg-surface-dark border-border/30 rounded-xl text-base text-muted-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Observation Textarea */}
          <div className="relative">
            <div className={cn(
              "absolute left-4 top-4 transition-colors",
              observationFocused ? "text-primary" : "text-muted-foreground"
            )}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <Textarea
              placeholder="Observações (opcional, ex: aniversário, alergias)"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              onFocus={() => setObservationFocused(true)}
              onBlur={() => setObservationFocused(false)}
              rows={3}
              className="pl-12 pt-4 bg-surface-dark border-border/30 rounded-xl text-base text-muted-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      </form>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8 z-50">
        <Button
          type="submit"
          disabled={isSubmitting || !date || !time || !name || !phone}
          onClick={handleSubmit}
          className={cn(
            "w-full h-14 text-lg font-semibold rounded-full transition-all",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.5)]",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:shadow-none"
          )}
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Confirmando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Confirmar Reserva
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReservationsPage;
