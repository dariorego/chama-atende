import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModulesMap, MODULE_NAME_MAP } from "@/types/restaurant";

const DEFAULT_MODULES: ModulesMap = {
  menu: false,
  waiterCall: false,
  reservations: false,
  queue: false,
  kitchenOrder: false,
  customerReview: false,
  preOrders: false,
};

/**
 * Hook to fetch restaurant modules
 * @param restaurantId - Optional restaurant ID. If not provided, fetches all active modules.
 */
export function useRestaurantModules(restaurantId?: string) {
  return useQuery({
    queryKey: ['restaurant-modules', restaurantId],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_modules')
        .select('module_name, is_active, settings')
        .eq('is_active', true);

      // Filter by restaurant if provided
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform array to ModulesMap object
      const modules: ModulesMap = { ...DEFAULT_MODULES };
      
      data?.forEach((module) => {
        const key = MODULE_NAME_MAP[module.module_name];
        if (key) {
          modules[key] = module.is_active ?? false;
        }
      });

      return modules;
    },
  });
}

/**
 * Hook that uses TenantContext to get modules for current tenant
 */
export function useTenantModules() {
  // Dynamic import to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useTenant } = require('@/hooks/useTenant');
  const { tenantId } = useTenant();
  return useRestaurantModules(tenantId ?? undefined);
}
