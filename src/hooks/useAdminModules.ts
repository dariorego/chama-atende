import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RestaurantModule {
  id: string;
  module_name: string;
  is_active: boolean;
  settings: Record<string, unknown>;
}

export const MODULE_INFO: Record<string, { label: string; description: string; icon: string }> = {
  menu: {
    label: "Cardápio Digital",
    description: "Exibir cardápio digital para os clientes",
    icon: "UtensilsCrossed",
  },
  waiter_call: {
    label: "Chamar Atendente",
    description: "Permite que clientes chamem o garçom pela mesa",
    icon: "Bell",
  },
  reservations: {
    label: "Reservas",
    description: "Sistema de reservas online",
    icon: "CalendarDays",
  },
  queue: {
    label: "Fila de Espera",
    description: "Gerenciamento de fila de espera",
    icon: "Users",
  },
  kitchen_order: {
    label: "Pedidos na Cozinha",
    description: "Pedidos direto para a cozinha",
    icon: "ChefHat",
  },
  customer_review: {
    label: "Avaliações",
    description: "Coletar avaliações dos clientes",
    icon: "Star",
  },
  pre_orders: {
    label: "Encomendas",
    description: "Sistema de encomendas antecipadas",
    icon: "ShoppingBag",
  },
};

export function useAdminModules() {
  const queryClient = useQueryClient();

  const {
    data: modules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurant_modules").select("id, module_name, is_active, settings");

      if (error) throw error;
      return data as RestaurantModule[];
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: string; isActive: boolean }) => {
      const { error } = await supabase.from("restaurant_modules").update({ is_active: isActive }).eq("id", moduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-modules"] });
      toast.success("Módulo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error toggling module:", error);
      toast.error("Erro ao atualizar módulo");
    },
  });

  return {
    modules,
    isLoading,
    error,
    toggleModule: toggleModuleMutation.mutate,
    isToggling: toggleModuleMutation.isPending,
  };
}
