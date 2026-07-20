import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Share2, MoreHorizontal, MapPin, Star, User, Phone, Bell, Clock, X, ChevronRight, Zap, MessageSquare, Minus, Plus, Loader2, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useTenant } from "@/hooks/useTenant";
import {
  useClientQueueEntry,
  useQueuePosition,
  useJoinQueue,
  useLeaveQueue,
  useSearchQueueByPhone,
  saveQueueCode,
  getStoredQueueCode,
  clearQueueCode,
} from "@/hooks/useClientQueue";

export default function QueuePage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState("join");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchPhoneInput, setSearchPhoneInput] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [observation, setObservation] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [queueCode, setQueueCode] = useState<string | null>(null);

  const { restaurant, isLoading: isLoadingRestaurant } = useAdminSettings();
  const { data: queueEntry, isLoading: isLoadingEntry } = useClientQueueEntry(queueCode);
  const { data: currentPosition } = useQueuePosition(queueCode);
  const joinQueue = useJoinQueue();
  const leaveQueue = useLeaveQueue();
  const { data: searchResult, isLoading: isSearching, search: searchByPhone, clearSearch, searchPhone } = useSearchQueueByPhone();

  // Load stored queue code on mount
  useEffect(() => {
    const stored = getStoredQueueCode();
    if (stored) {
      setQueueCode(stored);
    }
  }, []);

  // Check if entry is still valid (not cancelled/seated)
  useEffect(() => {
    if (queueEntry && ['cancelled', 'seated', 'no_show'].includes(queueEntry.status)) {
      clearQueueCode();
      setQueueCode(null);
    }
  }, [queueEntry]);

  const handleJoinQueue = async () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    const entry = await joinQueue.mutateAsync({
      customer_name: name.trim(),
      phone: phone.trim() || undefined,
      party_size: partySize,
      notes: observation.trim() || undefined,
    });

    saveQueueCode(entry.queue_code);
    setQueueCode(entry.queue_code);
  };

  const handleLeaveQueue = async () => {
    if (!queueEntry) return;
    
    await leaveQueue.mutateAsync(queueEntry.id);
    clearQueueCode();
    setQueueCode(null);
    setName("");
    setPhone("");
    setPartySize(2);
    setObservation("");
  };

  const isLoading = isLoadingRestaurant || isLoadingEntry;
  const isInQueue = !!queueEntry && ['waiting', 'called'].includes(queueEntry.status);
  const isCalled = queueEntry?.status === 'called';

  // Calculate progress based on position
  const getProgress = () => {
    if (!currentPosition || !queueEntry?.position) return 0;
    const initialPosition = queueEntry.position;
    const progress = ((initialPosition - currentPosition) / initialPosition) * 100;
    return Math.max(0, Math.min(100, progress));
  };

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

  // Screen when in queue
  if (isInQueue && queueEntry) {
    const displayPosition = currentPosition || queueEntry.position || 1;
    const estimatedWait = queueEntry.estimated_wait_minutes || 10;

    return (
      <div className="min-h-screen bg-cream relative overflow-hidden">
        {/* Decorative emerald blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-deep/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4 border-b border-emerald-deep/10">
          <button onClick={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')} className="w-10 h-10 rounded-full bg-cream-soft border border-emerald-deep/15 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-emerald-deep" />
          </button>
          <div className="text-center">
            <p className="editorial-label text-gold">Aguardando</p>
            <h1 className="font-serif-editorial text-emerald-deep text-xl leading-none mt-0.5">Fila de espera</h1>
          </div>
          <div className="w-10" />
        </header>

        <div className="relative z-10 px-4 pb-32">
          {/* Status badge */}
          <div className="flex justify-center mb-6 pt-6">
            {isCalled ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold animate-pulse">
                <Bell className="h-4 w-4 text-gold" />
                <span className="editorial-label text-emerald-deep">É a sua vez — dirija-se ao balcão</span>
              </div>
            ) : displayPosition <= 3 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-deep/5 border border-emerald-deep/20">
                <Zap className="h-4 w-4 text-gold" />
                <span className="editorial-label text-emerald-deep">A fila está andando rápido</span>
              </div>
            ) : null}
          </div>

          {/* Main position card */}
          <div className="relative bg-cream-soft rounded-[2.5rem] p-8 mb-6 overflow-hidden border border-emerald-deep/10 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)]">
            {/* Decorative circles */}
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-gold/25" />
            <div className="absolute top-8 right-8 w-16 h-16 rounded-full border border-gold/40" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-deep/5" />

            <div className="relative z-10">
              {isCalled ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gold/15 border border-gold flex items-center justify-center animate-pulse">
                      <Bell className="h-10 w-10 text-gold" />
                    </div>
                  </div>
                  <p className="editorial-label text-gold text-center mb-2">Chamado</p>
                  <p className="text-center text-4xl font-serif-editorial text-emerald-deep mb-1">É a sua vez</p>
                  <p className="text-center text-emerald-deep/60 font-sans-editorial">Dirija-se ao balcão</p>
                </>
              ) : (
                <>
                  <p className="editorial-label text-gold text-center mb-3">Sua posição</p>
                  {/* Position number */}
                  <div className="flex items-start justify-center gap-1 mb-2">
                    <span className="text-8xl font-serif-editorial text-emerald-deep leading-none">{displayPosition}</span>
                    <span className="text-4xl font-serif-editorial text-gold mt-2">º</span>
                  </div>
                  <p className="text-center text-emerald-deep/60 font-sans-editorial mb-6">na fila</p>

                  {/* Estimated time highlight */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-deep/5 border border-gold/40">
                      <Clock className="h-5 w-5 text-gold" />
                      <div>
                        <p className="editorial-label text-emerald-deep/60">Tempo estimado</p>
                        <p className="text-xl font-serif-editorial text-emerald-deep">~{estimatedWait} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative">
                    <Progress value={getProgress()} className="h-2 relative bg-emerald-deep/10 [&>div]:bg-gold" />
                  </div>
                  <p className="text-center text-xs text-emerald-deep/60 font-sans-editorial mt-2">
                    {getProgress() > 0 ? `${Math.round(getProgress())}% do tempo de espera já passou` : 'Aguardando atendimento'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Queue code card */}
          <div className="bg-cream-soft rounded-2xl p-4 mb-4 border border-emerald-deep/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-deep/5 border border-gold/40 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="editorial-label text-emerald-deep/60">Código da fila</p>
                <p className="text-xl font-serif-editorial text-emerald-deep">{queueEntry.queue_code}</p>
              </div>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-cream-soft rounded-2xl p-4 mb-4 border border-emerald-deep/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-deep/5 border border-emerald-deep/15 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-deep" />
                </div>
                <div>
                  <p className="font-serif-editorial text-emerald-deep text-lg">{queueEntry.customer_name}</p>
                  <p className="text-sm text-emerald-deep/60 font-sans-editorial">
                    {queueEntry.party_size} {queueEntry.party_size === 1 ? "pessoa" : "pessoas"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-emerald-deep/40" />
            </div>
          </div>

          {/* Notifications card */}
          <div className="bg-cream-soft rounded-2xl p-4 mb-6 border border-emerald-deep/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-deep/5 border border-emerald-deep/15 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-emerald-deep" />
                </div>
                <div>
                  <p className="font-serif-editorial text-emerald-deep text-lg">Notificações</p>
                  <p className="text-sm text-emerald-deep/60 font-sans-editorial">Avisar quando chegar a vez</p>
                </div>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </div>

        {/* Fixed bottom button */}
        {!isCalled && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cream via-cream to-transparent pt-8">
            <Button
              onClick={handleLeaveQueue}
              variant="outline"
              disabled={leaveQueue.isPending}
              className="w-full h-14 rounded-full text-base font-sans-editorial border-destructive/40 text-destructive hover:bg-destructive/10 bg-cream-soft"
            >
              {leaveQueue.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <X className="h-5 w-5 mr-2" />
              )}
              Sair da Fila
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Form to join queue
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
            onClick={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')}
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
          <p className="editorial-label text-gold mb-2">Fila de espera</p>
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

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 bg-cream-soft border border-emerald-deep/10 rounded-2xl p-1 grid grid-cols-2 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)]">
            <TabsTrigger 
              value="join" 
              className="rounded-xl font-sans-editorial text-emerald-deep/70 data-[state=active]:bg-emerald-deep data-[state=active]:text-cream"
            >
              Entrar na Fila
            </TabsTrigger>
            <TabsTrigger 
              value="search"
              className="rounded-xl font-sans-editorial text-emerald-deep/70 data-[state=active]:bg-emerald-deep data-[state=active]:text-cream"
            >
              Consultar Posição
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Contents */}
      {activeTab === "join" ? (
        <>
          {/* Join Queue Form */}
          <div className="px-4 py-8 pb-32">
            <div className="mb-6">
              <p className="editorial-label text-gold">Reserve seu lugar</p>
              <h2 className="text-3xl font-serif-editorial text-emerald-deep leading-tight">Entre para a lista</h2>
            </div>
            {/* Name input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="name" className="editorial-label text-emerald-deep/70">
                Nome <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-deep/50" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-14 pl-12 rounded-2xl bg-cream-soft border-emerald-deep/15 text-emerald-deep focus:ring-2 focus:ring-gold focus:border-transparent text-base placeholder:text-emerald-deep/40"
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="phone" className="editorial-label text-emerald-deep/70">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-deep/50" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-14 pl-12 rounded-2xl bg-cream-soft border-emerald-deep/15 text-emerald-deep focus:ring-2 focus:ring-gold focus:border-transparent text-base placeholder:text-emerald-deep/40"
                />
              </div>
            </div>

            {/* Party size */}
            <div className="space-y-3 mb-4">
              <div className="bg-cream-soft rounded-2xl p-5 border border-emerald-deep/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif-editorial text-emerald-deep">Quantas pessoas?</h2>
                    <p className="text-xs text-emerald-deep/60 font-sans-editorial mt-0.5">
                      Mesas acima de 8 pessoas requerem confirmação.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => partySize > 1 && setPartySize(partySize - 1)}
                      disabled={partySize <= 1}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        partySize <= 1
                          ? "bg-emerald-deep/5 text-emerald-deep/30 cursor-not-allowed border border-emerald-deep/10"
                          : "bg-cream text-emerald-deep hover:bg-emerald-deep hover:text-cream border border-emerald-deep/15 active:scale-95"
                      )}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-3xl font-serif-editorial text-emerald-deep w-10 text-center">
                      {partySize}
                    </span>
                    <button
                      type="button"
                      onClick={() => partySize < 20 && setPartySize(partySize + 1)}
                      disabled={partySize >= 20}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        partySize >= 20
                          ? "bg-emerald-deep/40 text-cream cursor-not-allowed"
                          : "bg-emerald-deep text-cream hover:bg-emerald-deep/90 active:scale-95 shadow-[0_10px_25px_-10px_rgba(6,78,59,0.6)]"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Observation */}
            <div className="space-y-2">
              <Label htmlFor="observation" className="editorial-label text-emerald-deep/70">
                Observações (opcional)
              </Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Cadeirinha para bebê, aniversário..."
                className="min-h-[100px] rounded-2xl bg-cream-soft border-emerald-deep/15 text-emerald-deep focus:ring-2 focus:ring-gold focus:border-transparent resize-none placeholder:text-emerald-deep/40"
              />
            </div>
          </div>

          {/* Fixed bottom submit button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cream via-cream to-transparent pt-8">
            <Button
              onClick={handleJoinQueue}
              disabled={joinQueue.isPending || !name.trim()}
              className="w-full h-14 rounded-full bg-emerald-deep text-cream font-sans-editorial text-base tracking-wide shadow-[0_20px_40px_-15px_rgba(6,78,59,0.6)] hover:bg-emerald-deep/90 transition-all group border border-gold/40"
            >
              {joinQueue.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na Fila
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Search Queue Form */}
          <div className="px-4 py-8 pb-32">
            <div className="mb-6">
              <p className="editorial-label text-gold">Já está na lista?</p>
              <h2 className="text-3xl font-serif-editorial text-emerald-deep leading-tight">Consulte sua posição</h2>
            </div>
            {/* Phone search input */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="searchPhone" className="editorial-label text-emerald-deep/70">
                Telefone cadastrado
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-deep/50" />
                <Input
                  id="searchPhone"
                  value={searchPhoneInput}
                  onChange={(e) => setSearchPhoneInput(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-14 pl-12 pr-14 rounded-2xl bg-cream-soft border-emerald-deep/15 text-emerald-deep focus:ring-2 focus:ring-gold focus:border-transparent text-base placeholder:text-emerald-deep/40"
                />
                <button
                  onClick={() => searchByPhone(searchPhoneInput)}
                  disabled={searchPhoneInput.replace(/\D/g, '').length < 8}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    searchPhoneInput.replace(/\D/g, '').length >= 8
                      ? "bg-emerald-deep text-cream"
                      : "bg-emerald-deep/10 text-emerald-deep/40"
                  )}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Result */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
              </div>
            )}

            {searchPhone && !isSearching && !searchResult && (
              <div className="bg-cream-soft rounded-2xl p-8 border border-emerald-deep/10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-deep/5 border border-gold/40 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gold" />
                </div>
                <h3 className="text-2xl font-serif-editorial text-emerald-deep mb-2">Nenhuma posição encontrada</h3>
                <p className="text-sm text-emerald-deep/60 font-sans-editorial">
                  Não encontramos nenhuma entrada na fila com este telefone.
                </p>
              </div>
            )}

            {searchResult && (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex justify-center">
                  {searchResult.status === 'called' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold animate-pulse">
                      <Bell className="h-4 w-4 text-gold" />
                      <span className="editorial-label text-emerald-deep">É a sua vez</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-deep/5 border border-emerald-deep/20">
                      <Clock className="h-4 w-4 text-emerald-deep" />
                      <span className="editorial-label text-emerald-deep">Aguardando na fila</span>
                    </div>
                  )}
                </div>

                {/* Position card */}
                <div className="bg-cream-soft rounded-2xl p-8 border border-emerald-deep/10 text-center shadow-[0_20px_60px_-30px_rgba(6,78,59,0.35)]">
                  <p className="editorial-label text-gold mb-2">Sua posição</p>
                  <div className="flex items-start justify-center gap-1 mb-2">
                    <span className="text-7xl font-serif-editorial text-emerald-deep leading-none">
                      {searchResult.position || 1}
                    </span>
                    <span className="text-3xl font-serif-editorial text-gold mt-1">º</span>
                  </div>
                  <p className="text-sm text-emerald-deep/60 font-sans-editorial">
                    Tempo estimado: ~{searchResult.estimated_wait_minutes || 10} min
                  </p>
                </div>

                {/* Queue code */}
                <div className="bg-cream-soft rounded-2xl p-4 border border-emerald-deep/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-deep/5 border border-gold/40 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="editorial-label text-emerald-deep/60">Código da fila</p>
                      <p className="text-xl font-serif-editorial text-emerald-deep">{searchResult.queue_code}</p>
                    </div>
                  </div>
                </div>

                {/* User info */}
                <div className="bg-cream-soft rounded-2xl p-4 border border-emerald-deep/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-deep/5 border border-emerald-deep/15 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-deep" />
                    </div>
                    <div>
                      <p className="font-serif-editorial text-emerald-deep text-lg">{searchResult.customer_name}</p>
                      <p className="text-sm text-emerald-deep/60 font-sans-editorial">
                        {searchResult.party_size} {searchResult.party_size === 1 ? "pessoa" : "pessoas"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={() => {
                    saveQueueCode(searchResult.queue_code);
                    setQueueCode(searchResult.queue_code);
                  }}
                  className="w-full h-14 rounded-full bg-emerald-deep text-cream font-sans-editorial text-base tracking-wide border border-gold/40 hover:bg-emerald-deep/90"
                >
                  Ver detalhes completos
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
