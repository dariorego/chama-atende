import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  roles: string[];
}

export function useAdminUsers() {
  const { profile } = useCurrentUser();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users', profile?.restaurant_id],
    queryFn: async () => {
      // First, get profiles from the same restaurant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, created_at')
        .eq('restaurant_id', profile!.restaurant_id!);

      if (profilesError) throw profilesError;

      // Then, get roles for each user
      const usersWithRoles: AdminUser[] = await Promise.all(
        (profiles || []).map(async (p) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', p.id);

          return {
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            is_active: p.is_active ?? true,
            created_at: p.created_at || '',
            roles: (rolesData || []).map((r) => r.role),
          };
        })
      );

      return usersWithRoles;
    },
    enabled: !!profile?.restaurant_id,
  });

  return {
    users,
    isLoading,
    error,
  };
}
