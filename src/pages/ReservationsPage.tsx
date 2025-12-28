import { useState } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

const ReservationsPage = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [partySize, setPartySize] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !partySize || !name || !phone) {
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
      title: "Reserva solicitada!",
      description: "Aguarde a confirmação do estabelecimento",
    });
  };

  if (isSuccess) {
    return (
      <ClientLayout title="Reserva" showBack backTo="/">
        <div className="flex flex-col items-center justify-center py-12 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Reserva Solicitada!
          </h2>
          <p className="text-muted-foreground text-center max-w-xs mb-6">
            Sua solicitação foi enviada. Você receberá uma confirmação em breve.
          </p>

          <div className="w-full max-w-sm p-4 bg-secondary rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-3">Detalhes:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="text-foreground font-medium">
                  {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span className="text-foreground font-medium">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pessoas:</span>
                <span className="text-foreground font-medium">{partySize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
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
              setPartySize(undefined);
              setName("");
              setPhone("");
            }}
            className="mt-6"
          >
            Nova Reserva
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Fazer Reserva" showBack backTo="/">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-secondary border-border",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <Label>Horário</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="h-12 bg-secondary border-border">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecione um horário" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectItem value="10+">Mais de 10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
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
              Enviando...
            </span>
          ) : (
            "Solicitar Reserva"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          A reserva será confirmada após aprovação do estabelecimento
        </p>
      </form>
    </ClientLayout>
  );
};

export default ReservationsPage;
