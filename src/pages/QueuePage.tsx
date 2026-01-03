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

  // Screen when in queue
  if (isInQueue && queueEntry) {
    const displayPosition = currentPosition || queueEntry.position || 1;
    const estimatedWait = queueEntry.estimated_wait_minutes || 10;

    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative green blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Fila de Espera</h1>
          <div className="w-10" />
        </header>

        <div className="relative z-10 px-4 pb-32">
          {/* Status badge */}
          <div className="flex justify-center mb-6">
            {isCalled ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 animate-pulse">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">É a sua vez! Dirija-se ao balcão.</span>
              </div>
            ) : displayPosition <= 3 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-bounce">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">A fila está andando rápido!</span>
              </div>
            ) : null}
          </div>

          {/* Main position card */}
          <div className="relative bg-card rounded-[2.5rem] p-8 mb-6 overflow-hidden border border-border">
            {/* Decorative circles */}
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-primary/10" />
            <div className="absolute top-8 right-8 w-16 h-16 rounded-full border border-primary/10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5" />

            <div className="relative z-10">
              {isCalled ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                      <Bell className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-2xl font-bold text-foreground mb-2">É a sua vez!</p>
                  <p className="text-center text-muted-foreground">Dirija-se ao balcão</p>
                </>
              ) : (
                <>
                  {/* Position number */}
                  <div className="flex items-start justify-center gap-1 mb-2">
                    <span className="text-8xl font-bold text-foreground leading-none">{displayPosition}</span>
                    <span className="text-4xl font-bold text-primary mt-2">º</span>
                  </div>
                  <p className="text-center text-muted-foreground mb-6">na fila</p>

                  {/* Estimated time highlight */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tempo estimado</p>
                        <p className="text-xl font-bold text-primary">~{estimatedWait} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Progress value={getProgress()} className="h-3 relative" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {getProgress() > 0 ? `${Math.round(getProgress())}% do tempo de espera já passou` : 'Aguardando atendimento'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Queue code card */}
          <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código da fila</p>
                  <p className="text-xl font-bold text-foreground">{queueEntry.queue_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{queueEntry.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {queueEntry.party_size} {queueEntry.party_size === 1 ? "pessoa" : "pessoas"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Notifications card */}
          <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Notificações</p>
                  <p className="text-sm text-muted-foreground">Avisar quando chegar a vez</p>
                </div>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </div>

        {/* Fixed bottom button */}
        {!isCalled && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
            <Button
              onClick={handleLeaveQueue}
              variant="outline"
              disabled={leaveQueue.isPending}
              className="w-full h-14 rounded-full text-base font-medium border-destructive/30 text-destructive hover:bg-destructive/10"
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
          <TabsList className="w-full h-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-1 grid grid-cols-2">
            <TabsTrigger 
              value="join" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Entrar na Fila
            </TabsTrigger>
            <TabsTrigger 
              value="search"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
          <div className="px-4 py-6 pb-32">
            {/* Name input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-14 pl-12 rounded-2xl bg-surface border-border focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-surface-foreground"
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="phone" className="text-muted-foreground">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-14 pl-12 rounded-2xl bg-surface border-border focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-surface-foreground"
                />
              </div>
            </div>

            {/* Party size */}
            <div className="space-y-3 mb-4">
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
                      onClick={() => partySize > 1 && setPartySize(partySize - 1)}
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
                      onClick={() => partySize < 20 && setPartySize(partySize + 1)}
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

            {/* Observation */}
            <div className="space-y-2">
              <Label htmlFor="observation" className="text-muted-foreground">
                Observações (opcional)
              </Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Cadeirinha para bebê, aniversário..."
                className="min-h-[100px] rounded-2xl bg-surface border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none placeholder:text-surface-foreground"
              />
            </div>
          </div>

          {/* Fixed bottom submit button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
            <Button
              onClick={handleJoinQueue}
              disabled={joinQueue.isPending || !name.trim()}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all group"
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
          <div className="px-4 py-6 pb-32">
            {/* Phone search input */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="searchPhone" className="text-muted-foreground">
                Telefone cadastrado
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="searchPhone"
                  value={searchPhoneInput}
                  onChange={(e) => setSearchPhoneInput(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-14 pl-12 pr-14 rounded-2xl bg-surface border-border focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-surface-foreground"
                />
                <button
                  onClick={() => searchByPhone(searchPhoneInput)}
                  disabled={searchPhoneInput.replace(/\D/g, '').length < 8}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    searchPhoneInput.replace(/\D/g, '').length >= 8
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Result */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {searchPhone && !isSearching && !searchResult && (
              <div className="bg-surface rounded-2xl p-6 border border-border/30 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma posição encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Não encontramos nenhuma entrada na fila com este telefone.
                </p>
              </div>
            )}

            {searchResult && (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex justify-center">
                  {searchResult.status === 'called' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 animate-pulse">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">É a sua vez!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Aguardando na fila</span>
                    </div>
                  )}
                </div>

                {/* Position card */}
                <div className="bg-card rounded-2xl p-6 border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-2">Sua posição</p>
                  <div className="flex items-start justify-center gap-1 mb-2">
                    <span className="text-6xl font-bold text-foreground leading-none">
                      {searchResult.position || 1}
                    </span>
                    <span className="text-2xl font-bold text-primary mt-1">º</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tempo estimado: ~{searchResult.estimated_wait_minutes || 10} min
                  </p>
                </div>

                {/* Queue code */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Código da fila</p>
                      <p className="text-xl font-bold text-foreground">{searchResult.queue_code}</p>
                    </div>
                  </div>
                </div>

                {/* User info */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{searchResult.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
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
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold"
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
