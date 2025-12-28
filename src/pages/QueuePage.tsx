import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  MapPin,
  Star,
  User,
  Phone,
  Bell,
  Clock,
  X,
  ChevronRight,
  Zap,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QueuePage() {
  const navigate = useNavigate();
  const [isInQueue, setIsInQueue] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [observation, setObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  

  // Dados simulados
  const queuePosition = 3;
  const queueCode = "A-047";
  const estimatedWait = "15 min";
  const progressPercent = 70;

  const establishment = {
    name: "Bistro Verde",
    location: "Jardins, São Paulo",
    rating: 4.8,
    reviewCount: 324,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
  };

  const queueAvatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  ];

  const handleJoinQueue = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsInQueue(true);
    toast({
      title: "Você entrou na fila! 🎉",
      description: `Sua posição: ${queuePosition}º - Código: ${queueCode}`,
    });
  };

  const handleLeaveQueue = () => {
    setIsInQueue(false);
    setName("");
    setPhone("");
    setPartySize(2);
    setObservation("");
    toast({
      title: "Você saiu da fila",
      description: "Esperamos vê-lo em breve!",
    });
  };

  // Tela quando está na fila
  if (isInQueue) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative green blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Fila de Espera</h1>
          <div className="w-10" />
        </header>

        <div className="relative z-10 px-4 pb-32">
          {/* Fast queue badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-bounce">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">A fila está andando rápido!</span>
            </div>
          </div>

          {/* Main position card */}
          <div className="relative bg-card rounded-[2.5rem] p-8 mb-6 overflow-hidden border border-border">
            {/* Decorative circles */}
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-primary/10" />
            <div className="absolute top-8 right-8 w-16 h-16 rounded-full border border-primary/10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5" />

            <div className="relative z-10">
              {/* Position number */}
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-8xl font-bold text-foreground leading-none">{queuePosition}</span>
                <span className="text-4xl font-bold text-primary mt-2">º</span>
              </div>
              <p className="text-center text-muted-foreground mb-6">na fila</p>

              {/* Estimated time highlight */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo estimado</p>
                    <p className="text-xl font-bold text-primary">~{estimatedWait}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar with glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Progress value={progressPercent} className="h-3 relative" />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {progressPercent}% do tempo de espera já passou
              </p>
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
                  <p className="text-xl font-bold text-foreground">{queueCode}</p>
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
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {partySize} {partySize === 1 ? "pessoa" : "pessoas"}
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
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <Button
            onClick={handleLeaveQueue}
            variant="outline"
            className="w-full h-14 rounded-full text-base font-medium border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="h-5 w-5 mr-2" />
            Sair da Fila
          </Button>
        </div>
      </div>
    );
  }

  // Tela de formulário para entrar na fila
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
          <span className="text-foreground font-semibold">Entrar na Fila</span>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 pb-32">
        {/* Queue status with avatars */}
        <div className="bg-surface-dark/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {queueAvatars.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">+5</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">8 grupos na fila</p>
                <p className="text-sm text-muted-foreground">~25 min de espera</p>
              </div>
            </div>
          </div>
        </div>

        {/* Name input */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="name" className="text-muted-foreground">
            Nome
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="h-14 pl-12 rounded-2xl bg-surface-dark border-border focus:ring-2 focus:ring-primary focus:border-transparent text-base text-muted-foreground"
            />
          </div>
        </div>

        {/* Phone input */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="phone" className="text-muted-foreground">
            Telefone (opcional)
          </Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-14 pl-12 rounded-2xl bg-surface-dark border-border focus:ring-2 focus:ring-primary focus:border-transparent text-base text-muted-foreground"
            />
          </div>
        </div>

        {/* Party size */}
        <div className="space-y-3 mb-4">
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
            className="min-h-[100px] rounded-2xl bg-surface-dark border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-muted-foreground"
          />
        </div>
      </div>

      {/* Fixed bottom submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <Button
          onClick={handleJoinQueue}
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all group"
        >
          {isSubmitting ? (
            "Entrando..."
          ) : (
            <>
              Entrar na Fila
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
