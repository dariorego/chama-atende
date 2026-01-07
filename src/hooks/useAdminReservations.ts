import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Reservation {
  id: string;
  reservation_code: string;
  customer_name: string;
  phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes: string | null;
  admin_notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Gerar código sequencial para reservas do dia
async function generateReservationCode(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('reservations')
    .select('reservation_code')
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const lastCode = data[0].reservation_code;
    const match = lastCode.match(/R-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1], 10) + 1;
      return `R-${String(nextNumber).padStart(3, '0')}`;
    }
  }
  
  return 'R-001';
}

// Hook para listar todas as reservas com realtime
export function useAdminReservations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;
      return data as Reservation[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Hook para reservas pendentes
export function usePendingReservations() {
  const { data: reservations, ...rest } = useAdminReservations();
  
  const pendingReservations = reservations?.filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  return { data: pendingReservations, ...rest };
}

// Hook para reservas confirmadas
export function useConfirmedReservations() {
  const { data: reservations, ...rest } = useAdminReservations();
  
  const confirmedReservations = reservations?.filter(r => r.status === 'confirmed')
    .sort((a, b) => {
      const dateCompare = a.reservation_date.localeCompare(b.reservation_date);
      if (dateCompare !== 0) return dateCompare;
      return a.reservation_time.localeCompare(b.reservation_time);
    });
  
  return { data: confirmedReservations, ...rest };
}

// Hook para reservas de uma data específica
export function useReservationsByDate(date: string) {
  const { data: reservations, ...rest } = useAdminReservations();
  
  const dateReservations = reservations?.filter(r => 
    r.reservation_date === date && 
    (r.status === 'confirmed' || r.status === 'pending')
  ).sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
  
  return { data: dateReservations, ...rest };
}

// Hook para reservas de hoje
export function useTodayReservations() {
  const today = new Date().toISOString().split('T')[0];
  return useReservationsByDate(today);
}

// Hook para estatísticas
export function useReservationStats() {
  const { data: reservations } = useAdminReservations();
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const stats = {
    pending: reservations?.filter(r => r.status === 'pending').length || 0,
    confirmed: reservations?.filter(r => r.status === 'confirmed').length || 0,
    today: reservations?.filter(r => 
      r.reservation_date === today && 
      (r.status === 'confirmed' || r.status === 'pending')
    ).length || 0,
    thisMonth: reservations?.filter(r => 
      r.created_at >= startOfMonth
    ).length || 0,
  };
  
  return stats;
}

// Hook para criar reserva
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      customer_name: string;
      phone: string;
      party_size: number;
      reservation_date: string;
      reservation_time: string;
      notes?: string;
    }) => {
      const reservation_code = await generateReservationCode();

      const { error } = await supabase
        .from('reservations')
        .insert({
          reservation_code,
          customer_name: data.customer_name,
          phone: data.phone,
          party_size: data.party_size,
          reservation_date: data.reservation_date,
          reservation_time: data.reservation_time,
          notes: data.notes || null,
          status: 'pending',
        });

      if (error) throw error;

      // Evita conflito de RLS no SELECT (PostgREST return=representation)
      return {
        id: '',
        reservation_code,
        customer_name: data.customer_name,
        phone: data.phone,
        party_size: data.party_size,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        notes: data.notes || null,
        admin_notes: null,
        status: 'pending',
        confirmed_at: null,
        cancelled_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast({
        title: "Reserva solicitada",
        description: "Aguarde a confirmação do estabelecimento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao solicitar reserva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook para atualizar status da reserva
export function useUpdateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { 
      id: string; 
      status: Reservation['status'];
      admin_notes?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (admin_notes !== undefined) {
        updates.admin_notes = admin_notes;
      }
      
      // Definir timestamps baseado no status
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled' || status === 'no_show') {
        updates.cancelled_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      
      const statusMessages: Record<string, string> = {
        confirmed: 'Reserva confirmada com sucesso!',
        cancelled: 'Reserva cancelada.',
        completed: 'Cliente marcado como compareceu.',
        no_show: 'Cliente marcado como não compareceu.',
      };
      
      toast({
        title: statusMessages[data.status] || 'Reserva atualizada',
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar reserva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
