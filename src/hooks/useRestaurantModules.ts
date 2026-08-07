import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModulesMap, MODULE_NAME_MAP } from "@/types/restaurant";
import { useTenant } from "@/hooks/useTenant";

const DEFAULT_MODULES: ModulesMap = {
  menu: false,
  waiterCall: false,
  reservations: false,
  queue: false,
  kitchenOrder: false,
  customerReview: false,
  preOrders: false,
  vitrineDigital: false,
  digitalComanda: false,
  eventBookings: false,
  staffSchedule: false,
  whatsappAi: false,
  loyaltyCashback: false,
  coupons: false,
  referralProgram: false,
};

type RestaurantPlan = 'starter' | 'professional' | 'enterprise' | string | null | undefined;

function getPlanFallbackModules(plan: RestaurantPlan): ModulesMap {
  const modules: ModulesMap = {
    ...DEFAULT_MODULES,
    menu: true,
  };

  if (plan === 'professional' || plan === 'enterprise') {
    modules.waiterCall = true;
    modules.reservations = true;
    modules.queue = true;
    modules.kitchenOrder = true;
    modules.customerReview = true;
    modules.preOrders = true;
    modules.eventBookings = true;
  }

  return modules;
}

/**
 * Hook to fetch restaurant modules
 * @param restaurantId - Optional restaurant ID. If not provided, fetches all active modules.
 */
export function useRestaurantModules(
  restaurantId?: string,
  options?: { enabled?: boolean; fallbackPlan?: RestaurantPlan },
) {
  return useQuery({
    queryKey: ['restaurant-modules', restaurantId, options?.fallbackPlan],
    enabled: options?.enabled ?? true,
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
      // Migrated tenants may not have restaurant_modules rows yet. Keep their
      // public experience available according to the contracted plan.
      const modules: ModulesMap = data?.length
        ? { ...DEFAULT_MODULES }
        : getPlanFallbackModules(options?.fallbackPlan);
      
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
  const { tenant, tenantId } = useTenant();
  return useRestaurantModules(tenantId ?? undefined, {
    enabled: !!tenantId,
    fallbackPlan: tenant?.plan,
  });
}
