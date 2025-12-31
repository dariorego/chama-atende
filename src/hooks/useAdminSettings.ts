import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "sonner";
import { SocialLinks, WifiInfo } from "@/types/restaurant";

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
  social_links: SocialLinks;
  wifi_info: WifiInfo;
}

export interface UpdateRestaurantData {
  name?: string;
  subtitle?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string;
  opening_time?: string | null;
  closing_time?: string | null;
  social_links?: Record<string, string | undefined>;
  wifi_info?: Record<string, string | undefined>;
}

export function useAdminSettings() {
  const { profile } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['admin-restaurant', profile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', profile!.restaurant_id!)
        .maybeSingle();

      if (error) throw error;
      
      return {
        ...data,
        social_links: (data?.social_links as SocialLinks) || {},
        wifi_info: (data?.wifi_info as WifiInfo) || {},
      } as RestaurantSettings;
    },
    enabled: !!profile?.restaurant_id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateRestaurantData) => {
      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', profile!.restaurant_id!);

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
