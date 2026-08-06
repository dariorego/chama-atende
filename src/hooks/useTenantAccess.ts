import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';

export type TenantRole = 'owner' | 'admin' | 'manager' | 'staff';

export function useTenantAccess() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, tenant, isLoading: tenantLoading } = useTenant();

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

      return (data?.role as TenantRole | undefined) ?? null;
    },
    enabled: !!user?.id && !!tenantId,
  });

  // Dono do estabelecimento sempre tem acesso total, mesmo que a linha em
  // tenant_user_roles ainda não exista (tenants criados antes do vínculo).
  const isOwnerByRecord = !!user?.id && !!tenant?.owner_id && tenant.owner_id === user.id;

  const effectiveRole: TenantRole | null = tenantRole ?? (isOwnerByRecord ? 'owner' : null);

  const hasAccess = !!effectiveRole;
  const isOwner = effectiveRole === 'owner';
  const isAdmin = effectiveRole === 'owner' || effectiveRole === 'admin';
  const isManager = isAdmin || tenantRole === 'manager';

  return {
    tenantRole: effectiveRole,
    hasAccess,
    isOwner,
    isAdmin,
    isManager,
    isLoading: authLoading || tenantLoading || roleLoading,
  };
}
