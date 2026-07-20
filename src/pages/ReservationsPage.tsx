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
import { useTenant } from "@/hooks/useTenant";
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
  const { tenant } = useTenant();
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

  const handleCancelReservation = async (reservation: { id: string; phone: string }) => {
    await cancelReservation.mutateAsync({ id: reservation.id, phone: reservation.phone });
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
      <div className="min-h-screen flex items-center justify-center bg-[#e8e4d8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#e8e4d8]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <h1 className="text-3xl italic text-[#064e3b] mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Estabelecimento não encontrado</h1>
        <p className="text-[#064e3b]/60 text-center">
          O estabelecimento que você está procurando não existe ou está inativo.
        </p>
      </div>
    );
  }

  // Success Screen
  if (isSuccess && createdReservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8e4d8] p-4 md:p-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="max-w-4xl w-full bg-[#f5f0e0] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 p-8 md:p-14">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#064e3b] flex items-center justify-center mb-8 shadow-xl shadow-[#064e3b]/20">
              <Clock className="h-10 w-10 text-[#c9a84c]" />
            </div>
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#c9a84c] mb-3">Solicitação enviada</p>
            <h2 className="text-5xl italic text-[#064e3b] mb-4 leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Reserva Solicitada
            </h2>
            <p className="text-[#064e3b]/60 max-w-md mb-10">
              Sua reserva foi enviada e aguarda confirmação do estabelecimento. Consulte o status pelo telefone informado.
            </p>

            <div className="w-full max-w-md bg-white rounded-xl p-6 border border-[#0d7a5f]/10 shadow-sm text-left">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#064e3b]/50">Detalhes</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[#c9a84c]/15 text-[#8a6f22] border border-[#c9a84c]/30">
                  Aguardando
                </span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ["Código", <span key="c" className="font-mono font-bold text-[#c9a84c]">{createdReservation.reservation_code}</span>],
                  ["Data", format(new Date(createdReservation.reservation_date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })],
                  ["Horário", createdReservation.reservation_time.slice(0, 5)],
                  ["Pessoas", `${createdReservation.party_size} ${createdReservation.party_size === 1 ? "pessoa" : "pessoas"}`],
                  ["Nome", createdReservation.customer_name],
                ].map(([label, value], i, arr) => (
                  <div key={String(label)} className={cn("flex justify-between items-center py-2", i < arr.length - 1 && "border-b border-[#064e3b]/10")}>
                    <span className="text-[#064e3b]/50">{label}</span>
                    <span className="text-[#064e3b] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md">
              <button
                onClick={resetForm}
                className="flex-1 py-4 rounded-xl border border-[#064e3b]/20 text-[#064e3b] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#064e3b]/5 transition-colors"
              >
                Nova Reserva
              </button>
              <button
                onClick={() => {
                  setSearchPhone(createdReservation.phone);
                  setActiveTab("search");
                  resetForm();
                }}
                className="flex-1 py-4 rounded-xl bg-[#064e3b] text-[#f5f0e0] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#0d7a5f] transition-colors shadow-lg shadow-[#064e3b]/20"
              >
                Consultar Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e4d8] p-0 md:p-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-[#f5f0e0] md:rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 min-h-screen md:min-h-0">
        {/* Left: Immersive Image */}
        <div className="relative md:w-5/12 h-56 md:h-auto md:min-h-[720px] bg-[#064e3b] shrink-0">
          <img
            src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=1600&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b] via-[#064e3b]/40 to-transparent" />

          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5 text-[#f5f0e0]" />
            </button>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition">
                <Share2 className="h-4 w-4 text-[#f5f0e0]" />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition">
                <MoreHorizontal className="h-4 w-4 text-[#f5f0e0]" />
              </button>
            </div>
          </div>

          {/* Bottom overlay editorial */}
          <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 text-[#f5f0e0]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/20 backdrop-blur-sm border border-[#c9a84c]/40 mb-3 md:mb-4">
              <span className={cn("w-1.5 h-1.5 rounded-full", restaurant.status === "open" ? "bg-[#c9a84c] animate-pulse" : "bg-white/60")} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5f0e0]">
                {restaurant.status === "open" ? "Aberto agora" : "Fechado"}
              </span>
            </div>
            <p className="uppercase tracking-[0.25em] text-[10px] mb-2 font-medium text-[#c9a84c]">
              Experiência Gastronômica
            </p>
            <h2 className="text-4xl md:text-5xl italic leading-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-4 text-[#f5f0e0]/80">
              {restaurant.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs">{restaurant.address.split(",")[0]}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[#c9a84c] fill-[#c9a84c]" />
                <span className="text-xs font-medium">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reservation Panel */}
        <div className="w-full md:w-7/12 p-6 md:p-12 lg:p-14 md:overflow-y-auto md:max-h-[95vh] bg-[#f5f0e0]">
          {/* Toggle */}
          <div className="flex justify-start items-center mb-8 md:mb-10">
            <div className="flex bg-[#064e3b]/5 border border-[#064e3b]/10 p-1 rounded-full w-full max-w-[340px]">
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all",
                  activeTab === "new"
                    ? "bg-[#064e3b] text-[#f5f0e0] shadow-md"
                    : "text-[#064e3b]/50 hover:text-[#064e3b]"
                )}
              >
                Fazer Reserva
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all",
                  activeTab === "search"
                    ? "bg-[#064e3b] text-[#f5f0e0] shadow-md"
                    : "text-[#064e3b]/50 hover:text-[#064e3b]"
                )}
              >
                Consultar
              </button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden" />

            {/* New Reservation Tab */}
            <TabsContent value="new" className="mt-0">
              <h1 className="text-4xl md:text-5xl text-[#064e3b] mb-10 leading-tight italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Reserve sua mesa
              </h1>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Step 1: Date */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#064e3b]/50 font-bold mb-5">
                    1. Selecione a Data
                  </h3>
                  <div className="bg-white rounded-xl p-4 md:p-6 border border-[#0d7a5f]/10 shadow-sm">
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
                      caption_label: "text-sm font-semibold text-[#064e3b]",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        "h-8 w-8 text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded-full p-0 transition-all inline-flex items-center justify-center"
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex justify-between",
                      head_cell: "text-[#064e3b]/30 rounded-md w-10 font-bold text-[10px] tracking-wider uppercase",
                      row: "flex w-full mt-2 justify-between",
                      cell: cn(
                        "h-10 w-10 text-center text-sm p-0 relative",
                        "[&:has([aria-selected])]:bg-transparent"
                      ),
                      day: cn(
                        "h-10 w-10 p-0 font-medium rounded-lg transition-all text-[#064e3b]",
                        "hover:bg-[#0d7a5f]/10 focus:bg-[#0d7a5f]/10",
                        "aria-selected:opacity-100"
                      ),
                      day_range_end: "day-range-end",
                      day_selected: cn(
                        "bg-[#064e3b] text-[#f5f0e0] font-semibold",
                        "hover:bg-[#064e3b] hover:text-[#f5f0e0]",
                        "focus:bg-[#064e3b] focus:text-[#f5f0e0]",
                        "shadow-md"
                      ),
                      day_today: "ring-1 ring-[#c9a84c]/50 text-[#064e3b] font-semibold",
                      day_outside: "day-outside text-[#064e3b]/20",
                      day_disabled: "text-[#064e3b]/20",
                      day_hidden: "invisible",
                    }}
                  />
                  </div>
                </section>

                {/* Step 2: Time & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#064e3b]/50 font-bold mb-5">
                      2. Horário
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          className={cn(
                            "px-4 py-2.5 rounded-full text-xs font-medium transition-all",
                            time === slot
                              ? "bg-[#c9a84c] text-white shadow-sm"
                              : "border border-[#0d7a5f]/20 text-[#064e3b] hover:border-[#c9a84c] bg-white/40"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#064e3b]/50 font-bold mb-5">
                      3. Convidados
                    </h3>
                    <div className="flex items-center gap-2 bg-white border border-[#0d7a5f]/10 rounded-full p-1">
                      <button
                        type="button"
                        onClick={decrementPartySize}
                        disabled={partySize <= 1}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                          partySize <= 1
                            ? "text-[#064e3b]/20 cursor-not-allowed"
                            : "text-[#c9a84c] hover:bg-[#f5f0e0]"
                        )}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center font-semibold text-[#064e3b] text-lg tabular-nums">
                        {String(partySize).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={incrementPartySize}
                        disabled={partySize >= 20}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                          partySize >= 20
                            ? "text-[#064e3b]/20 cursor-not-allowed"
                            : "text-[#c9a84c] hover:bg-[#f5f0e0]"
                        )}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#064e3b]/40 mt-2 ml-1">
                      Mesas acima de 8 pessoas requerem confirmação.
                    </p>
                  </section>
                </div>

                {/* Step 4: Contact */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#064e3b]/50 font-bold mb-5">
                    4. Dados para Reserva
                  </h3>
                  <div className="space-y-2">
                    <div className="relative">
                      <User className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        nameFocused ? "text-[#c9a84c]" : "text-[#064e3b]/30"
                      )} />
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        className="w-full bg-transparent border-b border-[#064e3b]/10 py-3 pl-7 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#064e3b]/30 text-[#064e3b] font-medium"
                      />
                    </div>
                    <div className="relative">
                      <Phone className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        phoneFocused ? "text-[#c9a84c]" : "text-[#064e3b]/30"
                      )} />
                      <input
                        type="tel"
                        placeholder="WhatsApp (00) 00000-0000"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => setPhoneFocused(false)}
                        maxLength={15}
                        className="w-full bg-transparent border-b border-[#064e3b]/10 py-3 pl-7 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#064e3b]/30 text-[#064e3b] font-medium"
                      />
                    </div>
                    <div className="relative">
                      <MessageSquare className={cn(
                        "absolute left-0 top-4 w-4 h-4 transition-colors",
                        observationFocused ? "text-[#c9a84c]" : "text-[#064e3b]/30"
                      )} />
                      <textarea
                        placeholder="Observações especiais (opcional)"
                        rows={1}
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        onFocus={() => setObservationFocused(true)}
                        onBlur={() => setObservationFocused(false)}
                        className="w-full bg-transparent border-b border-[#064e3b]/10 py-3 pl-7 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#064e3b]/30 text-[#064e3b] font-medium resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createReservation.isPending}
                    className="w-full bg-[#064e3b] text-[#f5f0e0] py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#0d7a5f] transition-all active:scale-[0.98] shadow-xl shadow-[#064e3b]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {createReservation.isPending ? "Enviando..." : "Solicitar Reserva"}
                  </button>
                  <p className="text-center text-[9px] uppercase tracking-widest text-[#064e3b]/40 mt-6 font-medium">
                    Confirmação enviada em instantes via WhatsApp
                  </p>
                </div>
              </form>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-0">
              <h1 className="text-4xl md:text-5xl text-[#064e3b] mb-4 leading-tight italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Consultar Reserva
              </h1>
              <p className="text-sm text-[#064e3b]/60 mb-8">
                Digite o telefone usado na reserva para consultar o status.
              </p>

              <div className="relative mb-6">
                <Search className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                  searchPhoneFocused ? "text-[#c9a84c]" : "text-[#064e3b]/30"
                )} />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(formatPhoneInput(e.target.value))}
                  onFocus={() => setSearchPhoneFocused(true)}
                  onBlur={() => setSearchPhoneFocused(false)}
                  maxLength={15}
                  className="w-full bg-transparent border-b border-[#064e3b]/10 py-3 pl-7 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#064e3b]/30 text-[#064e3b] font-medium"
                />
              </div>

              {searchPhone.length >= 10 && (
                <label className="flex items-center gap-2 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={showPastReservations}
                    onChange={(e) => setShowPastReservations(e.target.checked)}
                    className="w-4 h-4 rounded border-[#064e3b]/30 bg-white text-[#c9a84c] focus:ring-[#c9a84c]"
                  />
                  <span className="text-xs text-[#064e3b]/60">
                    Mostrar reservas passadas e canceladas
                  </span>
                </label>
              )}

              <div className="space-y-4">
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#c9a84c]" />
                  </div>
                )}

                {!isSearching && searchPhone.length >= 10 && filteredReservations?.length === 0 && (
                  <div className="bg-white rounded-xl border border-[#0d7a5f]/10 p-8 text-center">
                    <AlertCircle className="h-10 w-10 mx-auto text-[#064e3b]/30 mb-3" />
                    <p className="text-sm text-[#064e3b]/60">
                      {showPastReservations
                        ? "Nenhuma reserva encontrada para este telefone."
                        : "Nenhuma reserva confirmada futura encontrada. Ative o filtro acima para ver todas."}
                    </p>
                  </div>
                )}

                {filteredReservations?.map((reservation) => {
                  const status = statusConfig[reservation.status] || statusConfig.pending;
                  const reservationDate = new Date(reservation.reservation_date + 'T12:00:00');

                  return (
                    <div key={reservation.id} className="bg-white rounded-xl border border-[#0d7a5f]/10 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-mono font-bold text-[#c9a84c] text-sm">
                          {reservation.reservation_code}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[#064e3b]/5 text-[#064e3b] border border-[#064e3b]/10">
                          {status.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-xs text-[#064e3b]/60">
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

                        <p className="text-[#064e3b] font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
                          {reservation.customer_name}
                        </p>

                        {reservation.notes && (
                          <p className="text-xs text-[#064e3b]/60 italic">
                            <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
                            {reservation.notes}
                          </p>
                        )}
                      </div>

                      {reservation.status === 'confirmed' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleShareWhatsApp(reservation)}
                            className="flex-1 py-2.5 rounded-lg border border-[#064e3b]/20 text-[#064e3b] text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#064e3b]/5 transition-colors flex items-center justify-center gap-1"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            Compartilhar
                          </button>
                          <button
                            onClick={() => handleCancelReservation(reservation)}
                            disabled={cancelReservation.isPending}
                            className="flex-1 py-2.5 rounded-lg bg-red-900/10 text-red-800 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-900/15 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      )}

                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleCancelReservation(reservation)}
                          disabled={cancelReservation.isPending}
                          className="mt-4 w-full py-2.5 rounded-lg bg-red-900/10 text-red-800 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-900/15 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancelar Reserva
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;
