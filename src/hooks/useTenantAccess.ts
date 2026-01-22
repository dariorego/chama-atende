import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';

export type TenantRole = 'owner' | 'admin' | 'manager' | 'staff';

export function useTenantAccess() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, isLoading: tenantLoading } = useTenant();

  const { data: tenantRole, isLoading: roleLoading } = useQuery({
    queryKey: ['tenant-role', user?.id, tenantId],
    queryFn: async () => {
      if (!user?.id || !tenantId) return null;

      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('restaurant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant role:', error);
        return null;
      }

      return data?.role as TenantRole | null;
    },
    enabled: !!user?.id && !!tenantId,
  });

  const hasAccess = !!tenantRole;
  const isOwner = tenantRole === 'owner';
  const isAdmin = tenantRole === 'owner' || tenantRole === 'admin';
  const isManager = isAdmin || tenantRole === 'manager';

  return {
    tenantRole,
    hasAccess,
    isOwner,
    isAdmin,
    isManager,
    isLoading: authLoading || tenantLoading || roleLoading,
  };
}
