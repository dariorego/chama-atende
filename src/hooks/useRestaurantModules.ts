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
};

export function useRestaurantModules(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['restaurant-modules', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_modules')
        .select('module_name, is_active, settings')
        .eq('restaurant_id', restaurantId!)
        .eq('is_active', true);

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
    enabled: !!restaurantId,
  });
}
