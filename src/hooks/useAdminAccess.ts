import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useAdminSettings } from './useAdminSettings';

export function useAdminAccess() {
  const { profile, roles, isLoading: isLoadingUser, isAdmin, isManager } = useCurrentUser();
  const { restaurant, isLoading: isLoadingRestaurant } = useAdminSettings();

  const hasAccess = useMemo(() => {
    if (!profile) return false;
    
    // User must be admin or manager
    return isAdmin || isManager;
  }, [profile, isAdmin, isManager]);

  const accessLevel = useMemo(() => {
    if (isAdmin) return 'admin';
    if (isManager) return 'manager';
    return 'staff';
  }, [isAdmin, isManager]);

  return {
    hasAccess,
    accessLevel,
    profile,
    restaurant,
    roles,
    isLoading: isLoadingUser || isLoadingRestaurant,
  };
}
