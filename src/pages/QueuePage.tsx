import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { QueueCard } from "@/components/ui/queue-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, Clock, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data - will be replaced with Supabase realtime
const queueData = [
  { id: "1", name: "João Silva", partySize: 4, waitTime: "5 min" },
  { id: "2", name: "Maria Santos", partySize: 2, waitTime: "15 min" },
  { id: "3", name: "Pedro Costa", partySize: 6, waitTime: "25 min" },
];

const QueuePage = () => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const { toast } = useToast();

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !partySize) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsInQueue(true);
    setMyPosition(queueData.length + 1);

    toast({
      title: "Você entrou na fila!",
      description: `Posição: ${queueData.length + 1}º`,
    });
  };

  const handleLeaveQueue = () => {
    setIsInQueue(false);
    setMyPosition(null);
    setName("");
    setPhone("");
    setPartySize(undefined);

    toast({
      title: "Você saiu da fila",
      description: "Esperamos vê-lo em breve!",
    });
  };

  // Queue View
  if (isInQueue && myPosition) {
    const estimatedWait = myPosition * 10;

    return (
      <ClientLayout title="Fila de Espera" showBack backTo="/">
        {/* My Position Card */}
        <div className="mb-6 p-6 bg-primary/10 border border-primary/30 rounded-2xl animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary-foreground">
                {myPosition}º
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Sua posição na fila</h2>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Tempo estimado: ~{estimatedWait} min</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-secondary rounded-xl border border-border mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Fique atento!</span> Você será
            notificado quando chegar sua vez. Caso não esteja presente quando
            chamado, sua posição poderá ser perdida.
          </p>
        </div>

        {/* Queue List */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Fila atual
          </h3>
          <div className="space-y-2">
            {queueData.map((person, index) => (
              <QueueCard
                key={person.id}
                position={index + 1}
                name={person.name}
                partySize={person.partySize}
                waitTime={person.waitTime}
              />
            ))}
            <QueueCard
              position={myPosition}
              name={name}
              partySize={parseInt(partySize || "1")}
              isCurrentUser
            />
          </div>
        </div>

        {/* Leave Queue Button */}
        <Button
          variant="outline"
          onClick={handleLeaveQueue}
          className="w-full h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Sair da Fila
        </Button>
      </ClientLayout>
    );
  }

  // Join Queue Form
  return (
    <ClientLayout title="Fila de Espera" showBack backTo="/">
      {/* Current Queue Status */}
      <div className="mb-6 p-4 bg-secondary rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pessoas na fila</p>
            <p className="text-2xl font-bold text-foreground">{queueData.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tempo estimado</p>
            <p className="text-lg font-semibold text-primary">
              ~{(queueData.length + 1) * 10} min
            </p>
          </div>
        </div>
      </div>

      {/* Queue Peek */}
      {queueData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Próximos da fila
          </h3>
          <div className="space-y-2">
            {queueData.slice(0, 3).map((person, index) => (
              <QueueCard
                key={person.id}
                position={index + 1}
                name={person.name}
                partySize={person.partySize}
                waitTime={person.waitTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Join Form */}
      <div className="p-5 bg-card border border-border rounded-xl">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <PartyPopper className="h-5 w-5 text-primary" />
          Entrar na Fila
        </h2>

        <form onSubmit={handleJoinQueue} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-secondary border-border"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 bg-secondary border-border"
            />
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label>Número de Pessoas</Label>
            <Select value={partySize} onValueChange={setPartySize}>
              <SelectTrigger className="h-12 bg-secondary border-border">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Quantas pessoas?" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "pessoa" : "pessoas"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <CheckCircle className="h-5 w-5" />
                Entrar na Fila
              </span>
            )}
          </Button>
        </form>
      </div>
    </ClientLayout>
  );
};

export default QueuePage;
