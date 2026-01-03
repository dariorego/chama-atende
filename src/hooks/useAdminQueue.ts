import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isToday } from "date-fns";

export interface QueueEntry {
  id: string;
  queue_code: string;
  customer_name: string;
  phone: string | null;
  party_size: number;
  notes: string | null;
  status: 'waiting' | 'called' | 'seated' | 'cancelled' | 'no_show';
  position: number | null;
  estimated_wait_minutes: number | null;
  joined_at: string;
  called_at: string | null;
  seated_at: string | null;
  cancelled_at: string | null;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Generate next queue code for today (A-001, A-002, etc.)
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

// Calculate estimated wait time based on average service time
async function calculateEstimatedWait(position: number): Promise<number> {
  const { data } = await supabase
    .from('queue_entries')
    .select('joined_at, seated_at')
    .eq('status', 'seated')
    .not('seated_at', 'is', null)
    .order('seated_at', { ascending: false })
    .limit(10);
  
  if (!data || data.length === 0) {
    return position * 10; // Default: 10 minutes per party
  }
  
  const totalMinutes = data.reduce((acc, entry) => {
    const joined = new Date(entry.joined_at).getTime();
    const seated = new Date(entry.seated_at!).getTime();
    return acc + (seated - joined) / 60000;
  }, 0);
  
  const avgMinutes = Math.round(totalMinutes / data.length);
  return Math.max(5, avgMinutes * position);
}

// Fetch all queue entries for today with realtime
export function useAdminQueue() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['admin-queue'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('joined_at', { ascending: true });
      
      if (error) throw error;
      return data as QueueEntry[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Get only waiting entries
export function useWaitingQueue() {
  const { data: allEntries, ...rest } = useAdminQueue();
  
  const waitingEntries = allEntries
    ?.filter(e => e.status === 'waiting')
    .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
  
  return { data: waitingEntries, ...rest };
}

// Get only called entries
export function useCalledQueue() {
  const { data: allEntries, ...rest } = useAdminQueue();
  
  const calledEntries = allEntries
    ?.filter(e => e.status === 'called')
    .sort((a, b) => new Date(a.called_at!).getTime() - new Date(b.called_at!).getTime());
  
  return { data: calledEntries, ...rest };
}

// Get today's history (seated, cancelled, no_show)
export function useQueueHistory() {
  const { data: allEntries, ...rest } = useAdminQueue();
  
  const historyEntries = allEntries
    ?.filter(e => ['seated', 'cancelled', 'no_show'].includes(e.status))
    .sort((a, b) => {
      const timeA = a.seated_at || a.cancelled_at || a.updated_at;
      const timeB = b.seated_at || b.cancelled_at || b.updated_at;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  
  return { data: historyEntries, ...rest };
}

// Queue statistics
export function useQueueStats() {
  const { data: allEntries } = useAdminQueue();
  
  if (!allEntries) {
    return {
      waiting: 0,
      called: 0,
      seated: 0,
      cancelled: 0,
      noShow: 0,
      total: 0,
      avgWaitTime: 0,
    };
  }
  
  const waiting = allEntries.filter(e => e.status === 'waiting').length;
  const called = allEntries.filter(e => e.status === 'called').length;
  const seated = allEntries.filter(e => e.status === 'seated').length;
  const cancelled = allEntries.filter(e => e.status === 'cancelled').length;
  const noShow = allEntries.filter(e => e.status === 'no_show').length;
  
  // Calculate average wait time for seated entries
  const seatedEntries = allEntries.filter(e => e.status === 'seated' && e.seated_at);
  let avgWaitTime = 0;
  
  if (seatedEntries.length > 0) {
    const totalMinutes = seatedEntries.reduce((acc, entry) => {
      const joined = new Date(entry.joined_at).getTime();
      const seated = new Date(entry.seated_at!).getTime();
      return acc + (seated - joined) / 60000;
    }, 0);
    avgWaitTime = Math.round(totalMinutes / seatedEntries.length);
  }
  
  return {
    waiting,
    called,
    seated,
    cancelled,
    noShow,
    total: allEntries.length,
    avgWaitTime,
  };
}

// Create new queue entry
export function useCreateQueueEntry() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      toast({
        title: "Cliente adicionado",
        description: "Cliente entrou na fila com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à fila.",
        variant: "destructive",
      });
      console.error('Error creating queue entry:', error);
    },
  });
}

// Update queue entry status
export function useUpdateQueueEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status,
      ...rest 
    }: { 
      id: string; 
      status: QueueEntry['status'];
      [key: string]: any;
    }) => {
      const updates: any = { status, ...rest };
      
      // Set appropriate timestamp based on status
      if (status === 'called') {
        updates.called_at = new Date().toISOString();
      } else if (status === 'seated') {
        updates.seated_at = new Date().toISOString();
      } else if (status === 'cancelled' || status === 'no_show') {
        updates.cancelled_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('queue_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as QueueEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      
      const messages: Record<string, string> = {
        called: `${data.customer_name} foi chamado(a)!`,
        seated: `${data.customer_name} foi acomodado(a)!`,
        cancelled: `${data.customer_name} cancelou.`,
        no_show: `${data.customer_name} não compareceu.`,
      };
      
      toast({
        title: "Status atualizado",
        description: messages[data.status] || "Status atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
      console.error('Error updating queue entry:', error);
    },
  });
}

// Call next in queue
export function useCallNextInQueue() {
  const updateEntry = useUpdateQueueEntry();
  const { data: waitingEntries } = useWaitingQueue();

  return useMutation({
    mutationFn: async () => {
      if (!waitingEntries || waitingEntries.length === 0) {
        throw new Error('Não há clientes na fila');
      }
      
      const next = waitingEntries[0];
      return updateEntry.mutateAsync({ id: next.id, status: 'called' });
    },
  });
}
