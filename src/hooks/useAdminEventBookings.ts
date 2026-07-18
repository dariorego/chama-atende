import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useTenant } from "@/hooks/useTenant";

export type EventType = "birthday" | "corporate" | "wedding" | "group" | "other";
export type EventStatus = "pending" | "quoted" | "confirmed" | "cancelled" | "completed";

export interface EventBooking {
  id: string;
  restaurant_id: string;
  booking_code: string;
  event_type: EventType;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  budget_range: string | null;
  description: string | null;
  status: EventStatus;
  quote_amount: number | null;
  quote_details: string | null;
  admin_response: string | null;
  quoted_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  birthday: "Aniversário",
  corporate: "Corporativo",
  wedding: "Casamento",
  group: "Grupo",
  other: "Outro",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  pending: "Pendente",
  quoted: "Orçado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export function useAdminEventBookings() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  const query = useQuery({
    queryKey: ["admin-event-bookings", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_bookings")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventBooking[];
    },
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`event-bookings-${tenantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_bookings", filter: `restaurant_id=eq.${tenantId}` },
        () => queryClient.invalidateQueries({ queryKey: ["admin-event-bookings", tenantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tenantId]);

  return query;
}

export function useUpdateEventBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      quote_amount,
      quote_details,
      admin_response,
    }: {
      id: string;
      status?: EventStatus;
      quote_amount?: number | null;
      quote_details?: string | null;
      admin_response?: string | null;
    }) => {
      const updates: Record<string, unknown> = {};
      if (status !== undefined) {
        updates.status = status;
        if (status === "quoted") updates.quoted_at = new Date().toISOString();
        if (status === "confirmed") updates.confirmed_at = new Date().toISOString();
        if (status === "cancelled") updates.cancelled_at = new Date().toISOString();
      }
      if (quote_amount !== undefined) updates.quote_amount = quote_amount;
      if (quote_details !== undefined) updates.quote_details = quote_details;
      if (admin_response !== undefined) updates.admin_response = admin_response;

      const { error } = await supabase
        .from("event_bookings")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-bookings"] });
      toast({ title: "Reserva atualizada" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar reserva", description: err.message, variant: "destructive" });
    },
  });
}

export interface SubmitEventBookingInput {
  restaurant_id: string;
  event_type: EventType;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  event_date: string;
  event_time?: string;
  guest_count: number;
  budget_range?: string;
  description?: string;
}

export function useSubmitEventBooking() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: SubmitEventBookingInput) => {
      const code = `E-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("event_bookings").insert({
        restaurant_id: input.restaurant_id,
        booking_code: code,
        event_type: input.event_type,
        customer_name: input.customer_name,
        customer_email: input.customer_email ?? null,
        customer_phone: input.customer_phone,
        event_date: input.event_date,
        event_time: input.event_time ?? null,
        guest_count: input.guest_count,
        budget_range: input.budget_range ?? null,
        description: input.description ?? null,
        status: "pending",
      });
      if (error) throw error;
      return { booking_code: code };
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Em breve entraremos em contato com o orçamento.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}