import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useAdminSettings } from './useAdminSettings';
import { useTenantAccess } from './useTenantAccess';

export function useAdminAccess() {
  const { profile, roles, isLoading: isLoadingUser, isAdmin: isGlobalAdmin, isManager: isGlobalManager } = useCurrentUser();
  const { restaurant, isLoading: isLoadingRestaurant } = useAdminSettings();
  const { 
    hasAccess: hasTenantAccess, 
    isAdmin: isTenantAdmin, 
    isManager: isTenantManager,
    tenantRole,
    isLoading: isLoadingTenantAccess 
  } = useTenantAccess();

  const hasAccess = useMemo(() => {
    if (!profile) return false;
    
    // User must have access to this specific tenant
    // OR be a global admin (for backward compatibility during migration)
    return hasTenantAccess || isGlobalAdmin;
  }, [profile, hasTenantAccess, isGlobalAdmin]);

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
