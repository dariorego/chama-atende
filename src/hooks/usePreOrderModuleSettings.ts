import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PreOrderSettings {
  min_advance_hours: number;
}

const DEFAULT_SETTINGS: PreOrderSettings = {
  min_advance_hours: 24,
};

export function usePreOrderModuleSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['pre-order-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_modules')
        .select('settings')
        .eq('module_name', 'pre_orders')
        .maybeSingle();

      if (error) throw error;
      return (data?.settings as unknown as PreOrderSettings) ?? DEFAULT_SETTINGS;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PreOrderSettings>) => {
      const { data: module, error: fetchError } = await supabase
        .from('restaurant_modules')
        .select('id, settings')
        .eq('module_name', 'pre_orders')
        .single();

      if (fetchError) throw fetchError;

      const currentSettings = (module?.settings as unknown as PreOrderSettings) ?? DEFAULT_SETTINGS;
      const updatedSettings = { ...currentSettings, ...newSettings };

      const { error } = await supabase
        .from('restaurant_modules')
        .update({ settings: updatedSettings })
        .eq('id', module.id);

      if (error) throw error;
      return updatedSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-order-settings'] });
      toast.success('Configurações salvas!');
    },
    onError: (error) => {
      console.error('Error updating pre-order settings:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}
