import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useRestaurant } from './useRestaurant';

export function useAdminAccess(slug: string) {
  const { profile, roles, isLoading: isLoadingUser, isAdmin, isManager } = useCurrentUser();
  const { data: restaurant, isLoading: isLoadingRestaurant } = useRestaurant(slug);

  const hasAccess = useMemo(() => {
    if (!profile || !restaurant) return false;
    
    // User must belong to this restaurant
    if (profile.restaurant_id !== restaurant.id) return false;
    
    // User must be admin or manager
    return isAdmin || isManager;
  }, [profile, restaurant, isAdmin, isManager]);

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
