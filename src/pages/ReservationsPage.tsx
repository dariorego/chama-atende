import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Minus,
  Plus,
  CalendarDays,
  Sparkles,
  ArrowLeft,
  Share2,
  MoreHorizontal,
  MapPin,
  Star,
  Loader2,
  Search,
  Clock,
  Users,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useCreateClientReservation, useSearchReservations, useCancelReservation } from "@/hooks/useClientReservation";
import { Reservation } from "@/hooks/useAdminReservations";

const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: "Aguardando confirmação",
    className: "bg-warning/20 text-warning border-warning/30",
    icon: <Clock className="h-4 w-4" />,
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-success/20 text-success border-success/30",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-destructive/20 text-destructive border-destructive/30",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const ReservationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  
  // New reservation state
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [observation, setObservation] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [observationFocused, setObservationFocused] = useState(false);
  
  // Search state
  const [searchPhone, setSearchPhone] = useState("");
  const [searchPhoneFocused, setSearchPhoneFocused] = useState(false);
  const [showPastReservations, setShowPastReservations] = useState(false);
  
  const { toast } = useToast();
  const { restaurant, isLoading } = useAdminSettings();
  const createReservation = useCreateClientReservation();
  const { data: foundReservations, isLoading: isSearching } = useSearchReservations(searchPhone);
  const cancelReservation = useCancelReservation();

  // Filter reservations: by default show only confirmed + future dates
  const filteredReservations = foundReservations?.filter((reservation) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(reservation.reservation_date + 'T12:00:00');
    const isFuture = reservationDate >= today;

    if (showPastReservations) {
      return true; // Show all reservations
    }
    return reservation.status === 'confirmed' && isFuture;
  });

  // Handle WhatsApp share
  const handleShareWhatsApp = (reservation: Reservation) => {
    const reservationDate = new Date(reservation.reservation_date + 'T12:00:00');
    const formattedDate = format(reservationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = reservation.reservation_time.slice(0, 5);
    
    const socialLinks = restaurant?.social_links as { instagram?: string } | null;
    
    const message = `Olá! Nosso encontro será aqui:

📅 Data e hora: ${formattedDate} às ${formattedTime}
🏠 Nome do estabelecimento: ${restaurant?.name || ''}
📍 Endereço: ${restaurant?.address || 'Não informado'}
📞 Telefone: ${restaurant?.phone || 'Não informado'}
📸 Instagram: ${socialLinks?.instagram || 'Não informado'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
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

    const result = await createReservation.mutateAsync({
      customer_name: name,
      phone: phone,
      party_size: partySize,
      reservation_date: format(date, 'yyyy-MM-dd'),
      reservation_time: time,
      notes: observation || undefined,
    });

    setCreatedReservation(result);
    setIsSuccess(true);
  };

  const handleCancelReservation = async (id: string) => {
    await cancelReservation.mutateAsync(id);
  };

  const decrementPartySize = () => {
    if (partySize > 1) setPartySize(partySize - 1);
  };

  const incrementPartySize = () => {
    if (partySize < 20) setPartySize(partySize + 1);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setCreatedReservation(null);
    setDate(undefined);
    setTime(undefined);
    setPartySize(2);
    setName("");
    setPhone("");
    setObservation("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Restaurante não encontrado</h1>
        <p className="text-muted-foreground text-center">
          O restaurante que você está procurando não existe ou está inativo.
        </p>
      </div>
    );
  }

  // Success Screen
  if (isSuccess && createdReservation) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative h-80">
          <img
            src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          {/* Floating buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
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
            <h1 className="text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
            
            <div className="flex items-center gap-4">
              {restaurant.address && (
                <div className="flex items-center gap-1 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{restaurant.address.split(",")[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-8">
          <div className="flex flex-col items-center justify-center animate-scale-in">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-12 w-12 text-warning" />
              </div>
              <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-bounce">
                <Sparkles className="w-3 h-3" />
                Enviada!
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reserva Solicitada!
            </h2>
            <p className="text-muted-foreground text-center max-w-xs mb-2">
              Sua reserva foi enviada e aguarda confirmação do estabelecimento.
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              Consulte o status da sua reserva pelo telefone informado.
            </p>

            {/* Details Card */}
            <div className="w-full max-w-sm p-6 bg-surface rounded-2xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Detalhes da Reserva</h3>
                </div>
                <Badge variant="outline" className={statusConfig.pending.className}>
                  {statusConfig.pending.label}
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Código</span>
                  <span className="text-foreground font-mono font-bold">{createdReservation.reservation_code}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-foreground font-medium">
                    {format(new Date(createdReservation.reservation_date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="text-foreground font-medium">{createdReservation.reservation_time.slice(0, 5)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Pessoas</span>
                  <span className="text-foreground font-medium">{createdReservation.party_size} {createdReservation.party_size === 1 ? "pessoa" : "pessoas"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="text-foreground font-medium">{createdReservation.customer_name}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={resetForm}
                className="rounded-full px-8"
              >
                Nova Reserva
              </Button>
              <Button
                onClick={() => {
                  setSearchPhone(createdReservation.phone);
                  setActiveTab("search");
                  resetForm();
                }}
                className="rounded-full px-8"
              >
                Consultar Status
              </Button>
            </div>
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
          src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Floating buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
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
            <span className="text-xs font-medium text-primary">
              {restaurant.status === "open" ? "Aberto agora" : "Fechado"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
          
          <div className="flex items-center gap-4">
            {restaurant.address && (
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{restaurant.address.split(",")[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-1">
            <TabsTrigger value="new" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Fazer Reserva
            </TabsTrigger>
            <TabsTrigger value="search" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Consultar
            </TabsTrigger>
          </TabsList>

          {/* New Reservation Tab */}
          <TabsContent value="new" className="mt-0">
            <form onSubmit={handleSubmit} className="py-6 pb-32 space-y-6">
              {/* Section: Date */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Escolha uma data</h2>
                <div className="bg-surface rounded-2xl p-4 border border-border/30">
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
                            : "bg-surface text-foreground hover:bg-white/10 border border-border/30"
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
                <div className="bg-surface rounded-2xl p-5 border border-border/30">
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
                    className="h-14 pl-12 bg-surface border-border/30 rounded-xl text-base text-foreground placeholder:text-surface-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                    placeholder="WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    maxLength={15}
                    className="h-14 pl-12 bg-surface border-border/30 rounded-xl text-base text-foreground placeholder:text-surface-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                {/* Observation Input */}
                <div className="relative">
                  <div className={cn(
                    "absolute left-4 top-4 transition-colors",
                    observationFocused ? "text-primary" : "text-muted-foreground"
                  )}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <Textarea
                    placeholder="Observações (opcional)"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    onFocus={() => setObservationFocused(true)}
                    onBlur={() => setObservationFocused(false)}
                    className="min-h-[100px] pl-12 bg-surface border-border/30 rounded-xl text-base text-foreground placeholder:text-surface-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            </form>

            {/* Fixed bottom submit button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
              <Button
                onClick={handleSubmit}
                disabled={createReservation.isPending}
                className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
              >
                {createReservation.isPending ? "Enviando..." : "Solicitar Reserva"}
              </Button>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-0">
            <div className="py-6 pb-32 space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Consultar Reserva</h2>
                <p className="text-sm text-muted-foreground">
                  Digite o telefone usado na reserva para consultar o status.
                </p>
                
                {/* Search Input */}
                <div className="relative">
                  <div className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                    searchPhoneFocused ? "text-primary" : "text-muted-foreground"
                  )}>
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(formatPhoneInput(e.target.value))}
                    onFocus={() => setSearchPhoneFocused(true)}
                    onBlur={() => setSearchPhoneFocused(false)}
                    maxLength={15}
                    className="h-14 pl-12 bg-surface border-border/30 rounded-xl text-base text-foreground placeholder:text-surface-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                {/* Filter toggle */}
                {searchPhone.length >= 10 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPastReservations}
                      onChange={(e) => setShowPastReservations(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Mostrar reservas passadas e canceladas
                    </span>
                  </label>
                )}
              </div>

              {/* Results */}
              <div className="space-y-4">
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {!isSearching && searchPhone.length >= 10 && filteredReservations?.length === 0 && (
                  <Card className="bg-surface border-border/30">
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">
                        {showPastReservations 
                          ? "Nenhuma reserva encontrada para este telefone."
                          : "Nenhuma reserva confirmada futura encontrada. Ative o filtro acima para ver todas."}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {filteredReservations?.map((reservation) => {
                  const status = statusConfig[reservation.status] || statusConfig.pending;
                  const reservationDate = new Date(reservation.reservation_date + 'T12:00:00');
                  
                  return (
                    <Card key={reservation.id} className="bg-surface border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono font-bold text-primary">
                              {reservation.reservation_code}
                            </span>
                            <Badge variant="outline" className={cn("ml-2 text-xs", status.className)}>
                              {status.icon}
                              <span className="ml-1">{status.label}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{format(reservationDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{reservation.reservation_time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              <span>{reservation.party_size} pessoas</span>
                            </div>
                          </div>

                          <p className="text-foreground font-medium">{reservation.customer_name}</p>

                          {reservation.notes && (
                            <p className="text-sm text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
                              {reservation.notes}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        {reservation.status === 'confirmed' && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareWhatsApp(reservation)}
                              className="flex-1"
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Compartilhar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelReservation(reservation.id)}
                              disabled={cancelReservation.isPending}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}

                        {reservation.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelReservation(reservation.id)}
                            disabled={cancelReservation.isPending}
                            className="mt-4 w-full"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar Reserva
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReservationsPage;
