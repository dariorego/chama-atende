import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Plus, Clock, ArrowRight, Bell, Users, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const QueuePage = () => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState<number>(2);
  const [observation, setObservation] = useState("");
  const [showObservation, setShowObservation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(5);
  const [queueCode, setQueueCode] = useState("");
  const { toast } = useToast();

  const groupsAhead = 3;
  const estimatedWait = 15;

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e telefone",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const code = `#${Math.floor(1000 + Math.random() * 9000)}`;
    setQueueCode(code);
    setQueuePosition(groupsAhead + 1);
    setIsSubmitting(false);
    setIsInQueue(true);

    toast({
      title: "Você entrou na fila!",
      description: `Código: ${code}`,
    });
  };

  const handleLeaveQueue = () => {
    setIsInQueue(false);
    setName("");
    setPhone("");
    setPartySize(2);
    setObservation("");
    setQueueCode("");

    toast({
      title: "Você saiu da fila",
      description: "Esperamos vê-lo em breve!",
    });
  };

  // Queue Position View
  if (isInQueue) {
    const progressPercentage = ((10 - queuePosition) / 10) * 100;

    return (
      <ClientLayout title={`Fila ${queueCode}`} showBack backTo="/">
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              A FILA ESTÁ ANDANDO RÁPIDO!
            </span>
          </div>

          {/* Position Card */}
          <div className="p-6 bg-gradient-to-b from-secondary to-card rounded-2xl border border-border">
            <p className="text-center text-muted-foreground text-sm mb-2">
              Sua posição na fila
            </p>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="text-7xl font-bold text-foreground">{queuePosition}</span>
                <span className="absolute -top-1 -right-3 w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-xl font-semibold">{estimatedWait} min</span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                Tempo estimado de espera
              </p>

              {/* Progress Bar */}
              <div className="w-full mt-6 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercentage, 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">
                  Mesa para {partySize} {partySize === 1 ? "pessoa" : "pessoas"} • {phone}
                </p>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">
                Editar
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Notificar-me</p>
                <p className="text-sm text-muted-foreground">
                  SMS e Push {notificationsEnabled ? "(Ativado)" : "(Desativado)"}
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>

          {/* Leave Queue Button */}
          <button
            onClick={handleLeaveQueue}
            className="w-full flex items-center justify-center gap-2 py-4 text-destructive font-medium hover:text-destructive/80 transition-colors"
          >
            <X className="h-4 w-4" />
            Sair da fila
          </button>
        </div>
      </ClientLayout>
    );
  }

  // Join Queue Form
  return (
    <ClientLayout title="Fila de Espera" showBack backTo="/">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-foreground">Garanta sua mesa</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados abaixo para entrar na fila de espera virtual.
          </p>
        </div>

        <form onSubmit={handleJoinQueue} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Roberto Almeida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 pl-11 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Número de Celular <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 pl-11 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label>Quantas pessoas?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPartySize(num)}
                  className={cn(
                    "flex-1 h-12 rounded-lg font-semibold transition-all border",
                    partySize === num
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {num === 5 ? "5+" : num}
                </button>
              ))}
            </div>
          </div>

          {/* Observation Toggle */}
          <button
            type="button"
            onClick={() => setShowObservation(!showObservation)}
            className="flex items-center gap-2 text-primary font-medium text-sm hover:text-primary/80 transition-colors"
          >
            {showObservation ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adicionar observação ou preferência
          </button>

          {showObservation && (
            <Textarea
              placeholder="Ex: Prefiro mesa próxima à janela..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          )}

          {/* Queue Status */}
          <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-secondary flex items-center justify-center"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{groupsAhead} grupos na frente</p>
              <p className="text-sm text-muted-foreground">
                Tempo médio de espera: {estimatedWait} min
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold shadow-glow"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar na Fila
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </ClientLayout>
  );
};

export default QueuePage;
