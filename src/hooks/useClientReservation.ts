import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "./useAdminReservations";

// Normalizar telefone removendo caracteres especiais
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Hook para buscar reservas por telefone usando RPC seguro
export function useSearchReservations(phone: string | null) {
  return useQuery({
    queryKey: ['client-reservations', phone],
    queryFn: async () => {
      if (!phone || phone.length < 10) return [];

      const { data, error } = await supabase
        .rpc('search_reservations_by_phone', { search_phone: phone });

      if (error) throw error;
      return data as Reservation[];
    },
    enabled: !!phone && phone.length >= 10,
  });
}

// Hook para cancelar reserva pelo cliente
export function useCancelReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reservations'] });
      toast({
        title: "Reserva cancelada",
        description: "Sua reserva foi cancelada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook para criar reserva (usado na página pública)
export function useCreateClientReservation() {
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
      // Gerar código da reserva
      const today = new Date().toISOString().split('T')[0];
      
      const { data: lastReservation } = await supabase
        .from('reservations')
        .select('reservation_code')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1);

      let reservation_code = 'R-001';
      if (lastReservation && lastReservation.length > 0) {
        const lastCode = lastReservation[0].reservation_code;
        const match = lastCode.match(/R-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1], 10) + 1;
          reservation_code = `R-${String(nextNumber).padStart(3, '0')}`;
        }
      }

      const normalizedPhone = normalizePhone(data.phone);

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          reservation_code,
          customer_name: data.customer_name,
          phone: normalizedPhone,
          party_size: data.party_size,
          reservation_date: data.reservation_date,
          reservation_time: data.reservation_time,
          notes: data.notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return reservation as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reservations'] });
      toast({
        title: "Reserva solicitada!",
        description: "Aguarde a confirmação do estabelecimento. Você pode consultar o status pelo telefone.",
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
