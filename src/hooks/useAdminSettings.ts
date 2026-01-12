import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SocialLinks, WifiInfo, ThemeColors, IdentificationType, NotificationSettings, ThemeSettings, BusinessHours, DEFAULT_BUSINESS_HOURS, LocationCoordinates } from "@/types/restaurant";

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
  theme_settings: ThemeSettings;
  business_hours: BusinessHours;
  timezone: string;
  google_maps_url: string | null;
  location_coordinates: LocationCoordinates | null;
  plan: string | null;
  custom_domain: string | null;
  max_users: number | null;
  features: Record<string, boolean> | null;
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
  theme_settings?: Record<string, string | undefined>;
  business_hours?: BusinessHours;
  timezone?: string;
  google_maps_url?: string | null;
  location_coordinates?: LocationCoordinates | null;
}

/**
 * Hook for admin settings - now supports multi-tenant via restaurantId parameter
 * @param restaurantId - Optional restaurant ID. If not provided, uses TenantContext or falls back to first restaurant.
 */
export function useAdminSettings(restaurantId?: string) {
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['admin-restaurant', restaurantId],
    queryFn: async () => {
      let query = supabase
        .from('restaurants')
        .select('*');

      // If restaurantId provided, fetch specific restaurant
      if (restaurantId) {
        query = query.eq('id', restaurantId);
      } else {
        // Fallback: get first active restaurant (legacy single-tenant behavior)
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      
      return data ? {
        ...data,
        identification_type: (data.identification_type as IdentificationType) || 'table',
        social_links: (data.social_links as SocialLinks) || {},
        wifi_info: (data.wifi_info as WifiInfo) || {},
        theme_colors: (data.theme_colors as ThemeColors) || {},
        notification_settings: (data.notification_settings as NotificationSettings) || { sound_enabled: true },
        theme_settings: (data.theme_settings as ThemeSettings) || { client_default_theme: 'dark', admin_default_theme: 'dark' },
        business_hours: (data.business_hours as unknown as BusinessHours) || DEFAULT_BUSINESS_HOURS,
        timezone: (data.timezone as string) || 'America/Sao_Paulo',
        google_maps_url: (data.google_maps_url as string) || null,
        location_coordinates: (data.location_coordinates as unknown as LocationCoordinates) || null,
        plan: data.plan || 'starter',
        custom_domain: data.custom_domain || null,
        max_users: data.max_users || 3,
        features: (data.features as Record<string, boolean>) || {},
      } as RestaurantSettings : null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateRestaurantData) => {
      const targetId = restaurantId || restaurant?.id;
      if (!targetId) throw new Error("Restaurant not found");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from('restaurants')
        .update(updates as any)
        .eq('id', targetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
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

/**
 * Hook that uses TenantContext to get the current restaurant settings
 * Use this in components wrapped by TenantProvider
 */
export function useTenantSettings() {
  // Dynamic import to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useTenant } = require('@/hooks/useTenant');
  const { tenantId } = useTenant();
  return useAdminSettings(tenantId ?? undefined);
}
