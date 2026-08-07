import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useAdminSettings } from './useAdminSettings';
import { useTenantAccess } from './useTenantAccess';

export function useAdminAccess() {
  const { profile, roles, isLoading: isLoadingUser, isAdmin: isGlobalAdmin, isManager: isGlobalManager } = useCurrentUser();
  const { restaurant, isLoading: isLoadingRestaurant } = useAdminSettings();
  const { 
    hasAccess: hasTenantAccess, 
    tenantRole,
    isLoading: isLoadingTenantAccess 
  } = useTenantAccess();

  const hasAccess = useMemo(() => {
    // O acesso ao painel é exclusivamente do estabelecimento atual. Uma função
    // ou função global nunca deve liberar outro slug; o vínculo em
    // tenant_user_roles (ou owner_id) é a fonte de verdade.
    return Boolean(profile && hasTenantAccess);
  }, [profile, hasTenantAccess]);

  const accessLevel = useMemo(() => {
    // Prioritize tenant-specific role
    if (tenantRole === 'owner' || tenantRole === 'admin') return 'admin';
    if (tenantRole === 'manager') return 'manager';
    if (tenantRole === 'staff') return 'staff';
    
    // Fallback to global roles
    if (isGlobalAdmin) return 'admin';
    if (isGlobalManager) return 'manager';
    return 'staff';
  }, [tenantRole, isGlobalAdmin, isGlobalManager]);

  return {
    hasAccess,
    accessLevel,
    profile,
    restaurant,
    roles,
    tenantRole,
    isLoading: isLoadingUser || isLoadingRestaurant || isLoadingTenantAccess,
  };
}
