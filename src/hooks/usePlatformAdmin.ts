import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function usePlatformAdmin() {
  const { user, loading: authLoading } = useAuth();
  const query = useQuery({
    queryKey: ['platform-admin', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_platform_admin');
      if (error) throw error;
      return data === true;
    },
  });

  return {
    isPlatformAdmin: query.data ?? false,
    isLoading: authLoading || (!!user && query.isLoading),
    error: query.error,
  };
}
