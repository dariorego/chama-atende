import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  roles: string[];
  tenantRole: string | null;
}

export function useAdminUsers() {
  const { tenantId } = useTenant();

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      // Get users with roles for THIS specific tenant
      const { data: tenantRoles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('user_id, role')
        .eq('restaurant_id', tenantId);

      if (rolesError) throw rolesError;

      if (!tenantRoles || tenantRoles.length === 0) {
        return [];
      }

      // Get profiles for these users
      const userIds = tenantRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, created_at')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine profile data with tenant roles
      const usersWithRoles: AdminUser[] = (profiles || []).map((p) => {
        const userTenantRoles = tenantRoles.filter(r => r.user_id === p.id);
        
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          is_active: p.is_active ?? true,
          created_at: p.created_at || '',
          roles: userTenantRoles.map(r => r.role),
          tenantRole: userTenantRoles[0]?.role || null,
        };
      });

      return usersWithRoles;
    },
    enabled: !!tenantId,
  });

  return {
    users,
    isLoading,
    error,
    refetch,
  };
}
