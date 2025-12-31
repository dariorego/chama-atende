import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  restaurant_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserRole = 'admin' | 'manager' | 'staff';

export function useCurrentUser() {
  const { user, loading: authLoading } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const rolesQuery = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((r) => r.role as UserRole);
    },
    enabled: !!user?.id,
  });

  return {
    user,
    profile: profileQuery.data,
    roles: rolesQuery.data ?? [],
    isLoading: authLoading || profileQuery.isLoading || rolesQuery.isLoading,
    isAdmin: rolesQuery.data?.includes('admin') ?? false,
    isManager: rolesQuery.data?.includes('manager') ?? false,
    isStaff: rolesQuery.data?.includes('staff') ?? false,
  };
}
