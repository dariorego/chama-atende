import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PartyPopper,
  Calendar as CalendarIcon,
  Users,
  Phone,
  Mail,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  EventBooking,
  EventStatus,
  useAdminEventBookings,
  useUpdateEventBooking,
} from "@/hooks/useAdminEventBookings";

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  quoted: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "secondary",
};

function BookingCard({
  booking,
  onQuote,
  onStatus,
}: {
  booking: EventBooking;
  onQuote: (b: EventBooking) => void;
  onStatus: (id: string, status: EventStatus) => void;
}) {
  return (
    <Card className="bg-surface">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-primary" />
              {booking.booking_code}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {EVENT_TYPE_LABELS[booking.event_type]} · {booking.customer_name}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[booking.status]}>
            {EVENT_STATUS_LABELS[booking.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.event_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          {booking.event_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{booking.event_time.slice(0, 5)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{booking.guest_count} convidados</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_phone}</span>
          </div>
          {booking.customer_email && (
            <div className="flex items-center gap-2 col-span-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{booking.customer_email}</span>
            </div>
          )}
          {booking.budget_range && (
            <div className="flex items-center gap-2 col-span-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Faixa sugerida: {booking.budget_range}</span>
            </div>
          )}
        </div>

        {booking.description && (
          <div className="text-sm p-3 rounded-md bg-background/50 border border-border">
            <p className="text-muted-foreground text-xs mb-1">Detalhes do cliente</p>
            <p>{booking.description}</p>
          </div>
        )}

        {booking.quote_amount != null && (
          <div className="text-sm p-3 rounded-md bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Orçamento enviado</p>
            <p className="font-semibold text-lg text-primary">
              R$ {Number(booking.quote_amount).toFixed(2)}
            </p>
            {booking.quote_details && (
              <p className="text-sm mt-1 whitespace-pre-line">{booking.quote_details}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <Button size="sm" onClick={() => onQuote(booking)}>
              <DollarSign className="h-4 w-4 mr-1" />
              {booking.status === "pending" ? "Enviar orçamento" : "Editar orçamento"}
            </Button>
          )}
          {booking.status === "quoted" && (
            <Button size="sm" variant="secondary" onClick={() => onStatus(booking.id, "confirmed")}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          )}
          {booking.status === "confirmed" && (
            <Button size="sm" variant="secondary" onClick={() => onStatus(booking.id, "completed")}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar concluído
            </Button>
          )}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus(booking.id, "cancelled")}>
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminEventBookings() {
  const { data: bookings, isLoading } = useAdminEventBookings();
  const update = useUpdateEventBooking();

  const [quoteBooking, setQuoteBooking] = useState<EventBooking | null>(null);
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [response, setResponse] = useState("");

  const openQuote = (b: EventBooking) => {
    setQuoteBooking(b);
    setAmount(b.quote_amount != null ? String(b.quote_amount) : "");
    setDetails(b.quote_details ?? "");
    setResponse(b.admin_response ?? "");
  };

  const submitQuote = async () => {
    if (!quoteBooking) return;
    const numericAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    await update.mutateAsync({
      id: quoteBooking.id,
      status: "quoted",
      quote_amount: numericAmount,
      quote_details: details || null,
      admin_response: response || null,
    });
    setQuoteBooking(null);
  };

  const handleStatus = (id: string, status: EventStatus) => {
    update.mutate({ id, status });
  };

  const grouped = {
    pending: bookings?.filter((b) => b.status === "pending") ?? [],
    quoted: bookings?.filter((b) => b.status === "quoted") ?? [],
    confirmed: bookings?.filter((b) => b.status === "confirmed") ?? [],
    completed: bookings?.filter((b) => b.status === "completed" || b.status === "cancelled") ?? [],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="h-6 w-6 text-primary" />
          Reserva de Eventos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie solicitações de orçamento para aniversários, corporativos e grupos.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({grouped.pending.length})</TabsTrigger>
          <TabsTrigger value="quoted">Orçados ({grouped.quoted.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados ({grouped.confirmed.length})</TabsTrigger>
          <TabsTrigger value="completed">Histórico ({grouped.completed.length})</TabsTrigger>
        </TabsList>

        {(["pending", "quoted", "confirmed", "completed"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {grouped[tab].length === 0 ? (
              <Card className="bg-surface">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma solicitação nesta categoria.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {grouped[tab].map((b) => (
                  <BookingCard key={b.id} booking={b} onQuote={openQuote} onStatus={handleStatus} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!quoteBooking} onOpenChange={(o) => !o && setQuoteBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar orçamento</DialogTitle>
            <DialogDescription>
              {quoteBooking?.customer_name} · {quoteBooking && EVENT_TYPE_LABELS[quoteBooking.event_type]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor total (R$)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500.00"
                inputMode="decimal"
                className="bg-surface"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">O que está incluído</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Cardápio, bebidas, decoração, garçom dedicado..."
                rows={4}
                className="bg-surface"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response">Mensagem ao cliente</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Podemos oferecer... Entre em contato para confirmar."
                rows={3}
                className="bg-surface"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteBooking(null)}>
              Cancelar
            </Button>
            <Button onClick={submitQuote} disabled={!amount || update.isPending}>
              {update.isPending ? "Enviando..." : "Enviar orçamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}