import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours, startOfToday, isBefore, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePreOrderCart } from '@/hooks/usePreOrderCart';
import { useSubmitPreOrder } from '@/hooks/useSubmitPreOrder';
import { usePreOrderModuleSettings } from '@/hooks/usePreOrderModuleSettings';
import { CalendarIcon, Loader2, Clock, ShoppingBag, CreditCard, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customerPhone: z.string()
    .min(10, 'Telefone inválido')
    .regex(/^[\d\s()-]+$/, 'Formato de telefone inválido'),
  pickupDate: z.date({ required_error: 'Selecione uma data' }),
  pickupTime: z.string().min(1, 'Selecione um horário'),
  paymentMethod: z.enum(['pix', 'card'], { required_error: 'Selecione a forma de pagamento' }),
  observations: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Generate time slots from 8:00 to 22:00
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export default function PreOrderCheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = usePreOrderCart();
  const { mutateAsync: submitPreOrder, isPending } = useSubmitPreOrder();
  const { settings } = usePreOrderModuleSettings();

  const minAdvanceHours = settings?.min_advance_hours ?? 24;
  const minPickupDate = addHours(new Date(), minAdvanceHours);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      observations: '',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/encomendas/carrinho');
    }
  }, [items.length, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const validatePickupDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const pickupDateTime = new Date(date);
    pickupDateTime.setHours(hours, minutes, 0, 0);

    if (isBefore(pickupDateTime, minPickupDate)) {
      return `A encomenda deve ser feita com no mínimo ${minAdvanceHours}h de antecedência`;
    }
    return null;
  };

  const getAvailableTimeSlots = (selectedDate: Date | undefined) => {
    if (!selectedDate) return TIME_SLOTS;

    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    if (!isToday) return TIME_SLOTS;

    // Filter out times that don't meet minimum advance hours
    return TIME_SLOTS.filter((time) => {
      const [hours] = time.split(':').map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, 0, 0, 0);
      return !isBefore(slotTime, minPickupDate);
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    const validationError = validatePickupDateTime(data.pickupDate, data.pickupTime);
    if (validationError) {
      form.setError('pickupTime', { message: validationError });
      return;
    }

    try {
      const preOrder = await submitPreOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        pickupDate: format(data.pickupDate, 'yyyy-MM-dd'),
        pickupTime: data.pickupTime,
        paymentMethod: data.paymentMethod,
        observations: data.observations,
        items,
      });

      clearCart();
      navigate(`/encomendas/status/${preOrder.id}`);
    } catch (error) {
      console.error('Error submitting pre-order:', error);
    }
  };

  const selectedDate = form.watch('pickupDate');
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);

  if (items.length === 0) {
    return null;
  }

  return (
    <ClientLayout title="Finalizar Encomenda" showBack backTo="/encomendas/carrinho">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Resumo da Encomenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.productName}
                  </span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Date & Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Data e Horário de Retirada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Antecedência mínima: {minAdvanceHours} horas
              </p>

              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Retirada *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            // Reset time if it's no longer available
                            const currentTime = form.getValues('pickupTime');
                            const newAvailableSlots = getAvailableTimeSlots(date);
                            if (currentTime && !newAvailableSlots.includes(currentTime)) {
                              form.setValue('pickupTime', '');
                            }
                          }}
                          disabled={(date) => isBefore(date, startOfToday())}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Retirada *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedDate}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-3"
                      >
                        <div className={cn(
                          "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                          field.value === 'pix' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}>
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                              <QrCode className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <span className="font-medium">PIX</span>
                              <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                            </div>
                          </Label>
                        </div>
                        <div className={cn(
                          "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                          field.value === 'card' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}>
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <span className="font-medium">Cartão</span>
                              <p className="text-xs text-muted-foreground">Débito ou crédito na retirada</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field}
                        onChange={(e) => {
                          // Simple phone formatting
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.slice(0, 11);
                          if (value.length > 6) {
                            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                          } else if (value.length > 2) {
                            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                          } else if (value.length > 0) {
                            value = `(${value}`;
                          }
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguma observação especial?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Encomenda'
            )}
          </Button>
        </form>
      </Form>
    </ClientLayout>
  );
}
