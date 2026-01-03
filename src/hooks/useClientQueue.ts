import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { QueueEntry } from "./useAdminQueue";

// Generate next queue code for today
async function generateQueueCode(): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data } = await supabase
    .from('queue_entries')
    .select('queue_code')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (!data || data.length === 0) {
    return 'A-001';
  }
  
  const lastCode = data[0].queue_code;
  const match = lastCode.match(/([A-Z])-(\d{3})/);
  
  if (!match) {
    return 'A-001';
  }
  
  let letter = match[1];
  let number = parseInt(match[2], 10);
  
  number++;
  
  if (number > 999) {
    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    number = 1;
  }
  
  return `${letter}-${number.toString().padStart(3, '0')}`;
}

// Calculate position in queue
async function calculatePosition(): Promise<number> {
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting');
  
  return (count || 0) + 1;
}

// Calculate estimated wait time
async function calculateEstimatedWait(position: number): Promise<number> {
  const { data } = await supabase
    .from('queue_entries')
    .select('joined_at, seated_at')
    .eq('status', 'seated')
    .not('seated_at', 'is', null)
    .order('seated_at', { ascending: false })
    .limit(10);
  
  if (!data || data.length === 0) {
    return position * 10;
  }
  
  const totalMinutes = data.reduce((acc, entry) => {
    const joined = new Date(entry.joined_at).getTime();
    const seated = new Date(entry.seated_at!).getTime();
    return acc + (seated - joined) / 60000;
  }, 0);
  
  const avgMinutes = Math.round(totalMinutes / data.length);
  return Math.max(5, avgMinutes * position);
}

// Hook to get client's queue entry by code with realtime updates
export function useClientQueueEntry(queueCode: string | null) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['client-queue-entry', queueCode],
    queryFn: async () => {
      if (!queueCode) return null;
      
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_code', queueCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as QueueEntry | null;
    },
    enabled: !!queueCode,
  });

  // Realtime subscription
  useEffect(() => {
    if (!queueCode) return;

    const channel = supabase
      .channel(`client-queue-${queueCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `queue_code=eq.${queueCode}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-queue-entry', queueCode] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueCode, queryClient]);

  return query;
}

// Hook to get current position in queue
export function useQueuePosition(queueCode: string | null) {
  const { data: entry } = useClientQueueEntry(queueCode);
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['queue-position', queueCode],
    queryFn: async () => {
      if (!entry || entry.status !== 'waiting') return null;
      
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')
        .lt('joined_at', entry.joined_at);
      
      return (count || 0) + 1;
    },
    enabled: !!entry && entry.status === 'waiting',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to all queue changes to recalculate position
  useEffect(() => {
    if (!queueCode) return;

    const channel = supabase
      .channel('queue-position-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['queue-position', queueCode] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueCode, queryClient]);

  return query;
}

// Hook to join queue
export function useJoinQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customer_name: string;
      phone?: string;
      party_size: number;
      notes?: string;
    }) => {
      const queue_code = await generateQueueCode();
      const position = await calculatePosition();
      const estimated_wait_minutes = await calculateEstimatedWait(position);
      
      const { data: entry, error } = await supabase
        .from('queue_entries')
        .insert({
          queue_code,
          customer_name: data.customer_name,
          phone: data.phone || null,
          party_size: data.party_size,
          notes: data.notes || null,
          position,
          estimated_wait_minutes,
          status: 'waiting',
        })
        .select()
        .single();
      
      if (error) throw error;
      return entry as QueueEntry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['client-queue-entry'] });
      toast({
        title: "Você entrou na fila!",
        description: `Seu código é ${entry.queue_code}. Aguarde ser chamado.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível entrar na fila. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error joining queue:', error);
    },
  });
}

// Hook to leave queue (cancel)
export function useLeaveQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as QueueEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-queue-entry'] });
      toast({
        title: "Você saiu da fila",
        description: "Sua posição foi liberada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível sair da fila.",
        variant: "destructive",
      });
      console.error('Error leaving queue:', error);
    },
  });
}

// Hook to search queue entry by phone
export function useSearchQueueByPhone() {
  const [searchPhone, setSearchPhone] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['queue-search-phone', searchPhone],
    queryFn: async () => {
      if (!searchPhone) return null;

      // Clean phone number for search
      const cleanPhone = searchPhone.replace(/\D/g, '');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .gte('created_at', today.toISOString())
        .or(`phone.ilike.%${cleanPhone}%`)
        .in('status', ['waiting', 'called'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as QueueEntry | null;
    },
    enabled: !!searchPhone && searchPhone.replace(/\D/g, '').length >= 8,
  });

  const search = (phone: string) => {
    setSearchPhone(phone);
  };

  const clearSearch = () => {
    setSearchPhone(null);
  };

  return { ...query, search, clearSearch, searchPhone };
}

// Local storage helpers for persisting queue code
const QUEUE_CODE_KEY = 'queue_code';

export function saveQueueCode(code: string) {
  localStorage.setItem(QUEUE_CODE_KEY, code);
}

export function getStoredQueueCode(): string | null {
  return localStorage.getItem(QUEUE_CODE_KEY);
}

export function clearQueueCode() {
  localStorage.removeItem(QUEUE_CODE_KEY);
}
