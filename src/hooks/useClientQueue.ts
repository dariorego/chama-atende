import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";
import { callPublicApi } from "@/lib/publicApi";
import type { QueueEntry } from "./useAdminQueue";

interface QueueStats {
  lastCode: string | null;
  waitingCount: number;
  recentSeated: Array<{ joined_at: string; seated_at: string | null }>;
}

function nextCodeFrom(lastCode: string | null): string {
  if (!lastCode) return 'A-001';
  const match = lastCode.match(/([A-Z])-(\d{3})/);
  if (!match) return 'A-001';
  let letter = match[1];
  let number = parseInt(match[2], 10) + 1;
  if (number > 999) { letter = String.fromCharCode(letter.charCodeAt(0) + 1); number = 1; }
  return `${letter}-${number.toString().padStart(3, '0')}`;
}

function estimatedWaitFrom(stats: QueueStats, position: number): number {
  if (!stats.recentSeated.length) return position * 10;
  const totalMinutes = stats.recentSeated.reduce((acc, entry) => {
    const joined = new Date(entry.joined_at).getTime();
    const seated = new Date(entry.seated_at!).getTime();
    return acc + (seated - joined) / 60000;
  }, 0);
  const avg = Math.round(totalMinutes / stats.recentSeated.length);
  return Math.max(5, avg * position);
}

// Hook to get client's queue entry by code with realtime updates
export function useClientQueueEntry(queueCode: string | null, restaurantId?: string) {
  const phone = getStoredQueuePhone(restaurantId);
  return useQuery({
    queryKey: ['client-queue-entry', restaurantId, queueCode, phone],
    queryFn: async () => {
      if (!queueCode || !restaurantId) return null;
      const { data } = await callPublicApi<{ data: QueueEntry | null }>('get-queue-entry', {
        queueCode,
        restaurantId,
        phone: phone || undefined,
      });
      return data;
    },
    enabled: !!queueCode && !!restaurantId,
    refetchInterval: 10000,
  });
}

// Hook to get current position in queue
export function useQueuePosition(queueCode: string | null, restaurantId?: string) {
  return useQuery({
    queryKey: ['queue-position', restaurantId, queueCode],
    queryFn: async () => {
      if (!queueCode || !restaurantId) return null;
      const { position } = await callPublicApi<{ position: number | null }>('get-queue-position', { queueCode, restaurantId });
      return position;
    },
    enabled: !!queueCode && !!restaurantId,
    refetchInterval: 30000,
  });
}

const joinQueueSchema = z.object({
  customer_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(8).max(20).optional(),
  party_size: z.number().int().min(1).max(50),
  notes: z.string().trim().max(500).optional(),
});

// Hook to join queue
export function useJoinQueue(restaurantId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customer_name: string;
      phone?: string;
      party_size: number;
      notes?: string;
    }) => {
      if (!restaurantId) throw new Error('Estabelecimento não identificado');
      const validated = joinQueueSchema.parse(data);
      const stats = await callPublicApi<QueueStats>('get-queue-stats', { restaurantId });
      const queue_code = nextCodeFrom(stats.lastCode);
      const position = stats.waitingCount + 1;
      const estimated_wait_minutes = estimatedWaitFrom(stats, position);

      const { error } = await supabase
        .from('queue_entries')
        .insert({
          restaurant_id: restaurantId,
          queue_code,
          customer_name: validated.customer_name,
          phone: validated.phone || null,
          party_size: validated.party_size,
          notes: validated.notes || null,
          position,
          estimated_wait_minutes,
          status: 'waiting',
        });

      if (error) throw error;
      if (validated.phone) saveQueuePhone(validated.phone, restaurantId);
      return { queue_code, position, estimated_wait_minutes } as unknown as QueueEntry;
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
export function useLeaveQueue(restaurantId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const phone = getStoredQueuePhone(restaurantId);
      if (!phone || !restaurantId) throw new Error('Telefone e estabelecimento necessários para sair da fila');
      await callPublicApi('cancel-queue-entry', { id, phone, restaurantId });
      return { id } as unknown as QueueEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-queue-entry'] });
      clearQueuePhone(restaurantId);
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
export function useSearchQueueByPhone(restaurantId?: string) {
  const [searchPhone, setSearchPhone] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['queue-search-phone', restaurantId, searchPhone],
    queryFn: async () => {
      if (!searchPhone || !restaurantId) return null;
      const { data } = await callPublicApi<{ data: QueueEntry | null }>('search-queue-by-phone', { phone: searchPhone, restaurantId });
      return data;
    },
    enabled: !!restaurantId && !!searchPhone && searchPhone.replace(/\D/g, '').length >= 8,
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
const QUEUE_PHONE_KEY = 'queue_phone';

function tenantStorageKey(base: string, restaurantId?: string) {
  return restaurantId ? `${base}:${restaurantId}` : base;
}

export function saveQueueCode(code: string, restaurantId?: string) {
  localStorage.setItem(tenantStorageKey(QUEUE_CODE_KEY, restaurantId), code);
}

export function getStoredQueueCode(restaurantId?: string): string | null {
  return localStorage.getItem(tenantStorageKey(QUEUE_CODE_KEY, restaurantId));
}

export function clearQueueCode(restaurantId?: string) {
  localStorage.removeItem(tenantStorageKey(QUEUE_CODE_KEY, restaurantId));
}

export function saveQueuePhone(phone: string, restaurantId?: string) {
  try { localStorage.setItem(tenantStorageKey(QUEUE_PHONE_KEY, restaurantId), phone); } catch { /* ignore */ }
}

export function getStoredQueuePhone(restaurantId?: string): string | null {
  try { return localStorage.getItem(tenantStorageKey(QUEUE_PHONE_KEY, restaurantId)); } catch { return null; }
}

export function clearQueuePhone(restaurantId?: string) {
  try { localStorage.removeItem(tenantStorageKey(QUEUE_PHONE_KEY, restaurantId)); } catch { /* ignore */ }
}
