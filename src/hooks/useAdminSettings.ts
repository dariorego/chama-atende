import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SocialLinks, WifiInfo, ThemeColors, IdentificationType, NotificationSettings } from "@/types/restaurant";

export interface RestaurantSettings {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  opening_time: string | null;
  closing_time: string | null;
  identification_type: IdentificationType;
  social_links: SocialLinks;
  wifi_info: WifiInfo;
  theme_colors: ThemeColors;
  notification_settings: NotificationSettings;
}

export interface UpdateRestaurantData {
  name?: string;
  subtitle?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string;
  opening_time?: string | null;
  closing_time?: string | null;
  identification_type?: IdentificationType;
  social_links?: Record<string, string | undefined>;
  wifi_info?: Record<string, string | undefined>;
  theme_colors?: Record<string, string | undefined>;
  notification_settings?: Record<string, boolean | undefined>;
}

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['admin-restaurant'],
    queryFn: async () => {
      // Get the first active restaurant (single-tenant)
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      return data ? {
        ...data,
        identification_type: (data.identification_type as IdentificationType) || 'table',
        social_links: (data.social_links as SocialLinks) || {},
        wifi_info: (data.wifi_info as WifiInfo) || {},
        theme_colors: (data.theme_colors as ThemeColors) || {},
        notification_settings: (data.notification_settings as NotificationSettings) || { sound_enabled: true },
      } as RestaurantSettings : null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateRestaurantData) => {
      if (!restaurant?.id) throw new Error("Restaurant not found");
      
      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurant.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error) => {
      console.error('Error updating restaurant:', error);
      toast.error("Erro ao salvar configurações");
    },
  });

  return {
    restaurant,
    isLoading,
    error,
    updateRestaurant: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
