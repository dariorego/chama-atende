import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, PartyPopper, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { useTenant } from "@/hooks/useTenant";
import { cn } from "@/lib/utils";
import {
  EventType,
  EVENT_TYPE_LABELS,
  useSubmitEventBooking,
} from "@/hooks/useAdminEventBookings";

const BUDGET_OPTIONS = [
  "Até R$ 1.000",
  "R$ 1.000 - R$ 3.000",
  "R$ 3.000 - R$ 7.000",
  "R$ 7.000 - R$ 15.000",
  "Acima de R$ 15.000",
];

export default function EventBookingPage() {
  const { tenantId, tenant } = useTenant();
  const navigate = useNavigate();
  const submit = useSubmitEventBooking();

  const [eventType, setEventType] = useState<EventType>("birthday");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState<number>(20);
  const [budget, setBudget] = useState<string>("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState<string | null>(null);

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "");
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
  };

  const handleSubmit = async () => {
    if (!tenantId || !name || !phone || !date || !guests) return;
    const result = await submit.mutateAsync({
      restaurant_id: tenantId,
      event_type: eventType,
      customer_name: name,
      customer_phone: phone.replace(/\D/g, ""),
      customer_email: email || undefined,
      event_date: format(date, "yyyy-MM-dd"),
      event_time: time || undefined,
      guest_count: guests,
      budget_range: budget || undefined,
      description: description || undefined,
    });
    setCode(result.booking_code);
  };

  const slug = tenant?.slug ?? "";

  if (code) {
    return (
      <ClientLayout title="Reserva de Eventos" showBack backTo={`/${slug}`}>
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card className="bg-surface text-center">
            <CardContent className="pt-10 pb-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold">Solicitação enviada!</h2>
              <p className="text-muted-foreground">
                Seu código de acompanhamento é <span className="font-mono font-bold text-primary">{code}</span>.
                Entraremos em contato em breve com o orçamento personalizado.
              </p>
              <Button onClick={() => navigate(`/${slug}`)} className="mt-4">
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Reserva de Eventos" showBack backTo={`/${slug}`}>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              Solicite um orçamento
            </CardTitle>
            <CardDescription>
              Aniversários, corporativos, casamentos e grupos. Responderemos com uma proposta personalizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tipo de evento</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                <SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((k) => (
                    <SelectItem key={k} value={k}>{EVENT_TYPE_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-surface" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="bg-surface"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Data do evento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal bg-surface", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Horário (opcional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-surface"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guests">Nº de convidados</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                  className="bg-surface"
                />
              </div>
              <div className="grid gap-2">
                <Label>Faixa de orçamento</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className="bg-surface"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Conte-nos sobre o evento</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tema, cardápio desejado, restrições alimentares, decoração..."
                className="bg-surface"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name || !phone || !date || !guests || submit.isPending}
              className="w-full"
              size="lg"
            >
              {submit.isPending ? "Enviando..." : "Solicitar orçamento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}