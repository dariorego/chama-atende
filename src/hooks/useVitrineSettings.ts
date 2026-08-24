import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/useTenant';
import { isAvailableNow, useAvailabilityClock } from '@/lib/availability';

export type VitrineModel = 'cinema' | 'split' | 'mosaico';

export interface VitrineSettings {
  display_model: VitrineModel;
  interval_seconds: number;
  show_price: boolean;
}

export const DEFAULT_VITRINE_SETTINGS: VitrineSettings = {
  display_model: 'cinema',
  interval_seconds: 8,
  show_price: true,
};

export function useVitrineSettings() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vitrine-settings', tenantId],
    queryFn: async () => {
      if (!tenantId) return { settings: DEFAULT_VITRINE_SETTINGS, isActive: false };
      const { data, error } = await supabase
        .from('restaurant_modules')
        .select('id, is_active, settings')
        .eq('restaurant_id', tenantId)
        .eq('module_name', 'vitrine_digital')
        .maybeSingle();
      if (error) throw error;
      const settings = {
        ...DEFAULT_VITRINE_SETTINGS,
        ...((data?.settings as Partial<VitrineSettings>) ?? {}),
      } as VitrineSettings;
      return { id: data?.id, isActive: !!data?.is_active, settings };
    },
    enabled: !!tenantId,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<VitrineSettings>) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      const merged = { ...(data?.settings ?? DEFAULT_VITRINE_SETTINGS), ...updates };
      const { error } = await supabase
        .from('restaurant_modules')
        .update({ settings: merged })
        .eq('restaurant_id', tenantId)
        .eq('module_name', 'vitrine_digital');
      if (error) throw error;
      return merged;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitrine-settings', tenantId] });
      toast.success('Configurações salvas');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao salvar'),
  });

  return {
    settings: data?.settings ?? DEFAULT_VITRINE_SETTINGS,
    isActive: data?.isActive ?? false,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}

export function useVitrineDisplayProducts(tenantId?: string | null) {
  const now = useAvailabilityClock();

  const query = useQuery({
    queryKey: ['vitrine-display-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('menu_products')
        .select(`
          id, name, description, price, image_url, category_id,
          availability_enabled, available_days, available_from, available_to,
          category:menu_categories(availability_enabled, available_days, available_from, available_to)
        `)
        .eq('restaurant_id', tenantId)
        .eq('is_active', true)
        .eq('show_on_display', true)
        .order('display_order')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    refetchInterval: 60000,
  });

  // Hide products outside their availability window (category wins over item)
  const data = useMemo(() => {
    if (!query.data) return query.data;
    return query.data.filter(
      (p) =>
        isAvailableNow(p.category ?? null, undefined, now) && isAvailableNow(p, undefined, now),
    );
  }, [query.data, now]);

  return { ...query, data } as typeof query;
}