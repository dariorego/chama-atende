import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  // Server-side verification via SECURITY DEFINER function.
  // This is enforced regardless of client-side state.
  const { data: serverVerified, isLoading: isLoadingServer } = useQuery({
    queryKey: ['verify-admin-access', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return false;
      const { data, error } = await supabase.rpc('verify_admin_access');
      if (error) return false;
      return Boolean(data);
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  });

  const hasAccess = useMemo(() => {
    if (!profile) return false;
    // Server verification is authoritative; client checks are UI convenience.
    const clientAccess = hasTenantAccess || isGlobalAdmin;
    if (serverVerified === false) return false;
    return clientAccess;
  }, [profile, hasTenantAccess, isGlobalAdmin, serverVerified]);

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
    isLoading: isLoadingUser || isLoadingRestaurant || isLoadingTenantAccess || isLoadingServer,
  };
}
