import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

export interface RestaurantModule {
  id: string | null;
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
  vitrine_digital: {
    label: "Vitrine Digital",
    description: "Exibe produtos em rotação em uma TV",
    icon: "Tv",
  },
  digital_comanda: {
    label: "Comanda Digital",
    description: "Várias comandas por mesa (ex.: 10.01, 10.02) com fechamento individual",
    icon: "Receipt",
  },
  event_bookings: {
    label: "Reserva de Eventos",
    description: "Orçamento para aniversários, corporativos, casamentos e grupos",
    icon: "PartyPopper",
  },
  staff_schedule: {
    label: "Agenda de Funcionários",
    description: "Escala semanal, folgas e controle de ponto da equipe",
    icon: "CalendarClock",
  },
  whatsapp_ai: {
    label: "WhatsApp AI",
    description: "Atendimento no WhatsApp com chatbot inteligente (Evolution API + OpenRouter)",
    icon: "MessageCircle",
  },
  loyalty_cashback: {
    label: "Fidelidade e Cashback",
    description: "Pontos por compra, níveis de cliente e resgate de recompensas",
    icon: "Gift",
  },
  coupons: {
    label: "Cupons e Promoções",
    description: "Códigos de desconto por horário, categoria ou primeiro pedido",
    icon: "Tag",
  },
  referral_program: {
    label: "Programa de Indicação",
    description: "Cliente indica amigo e ambos ganham crédito",
    icon: "UserPlus",
  },
  technical_sheet: {
    label: "Ficha Técnica",
    description: "Insumos, fichas técnicas, CMV, desperdício e inventário",
    icon: "ClipboardList",
  },
  hygiene_checklists: {
    label: "Checklists de Higiene",
    description: "Registro por turno, validação de temperatura e controle de validade (ANVISA)",
    icon: "ShieldCheck",
  },
};

export function useAdminModules() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  const {
    data: modules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-modules", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("restaurant_modules")
        .select("id, module_name, is_active, settings")
        .eq("restaurant_id", tenantId);

      if (error) throw error;

      const rows = (data ?? []) as RestaurantModule[];

      // Catálogo completo: módulos novos podem ainda não ter linha no banco
      // (ex.: Ficha Técnica). Exibimos todos e criamos a linha ao ativar.
      const merged: RestaurantModule[] = Object.keys(MODULE_INFO).map((name) => {
        const row = rows.find((r) => r.module_name === name);
        return (
          row ?? {
            id: null,
            module_name: name,
            is_active: false,
            settings: {},
          }
        );
      });

      // Mantém eventuais módulos legados presentes no banco
      rows.forEach((row) => {
        if (!MODULE_INFO[row.module_name]) merged.push(row);
      });

      return merged;
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({
      moduleId,
      moduleName,
      isActive,
    }: {
      moduleId: string | null;
      moduleName?: string;
      isActive: boolean;
    }) => {
      if (moduleId) {
        const { error } = await supabase.from("restaurant_modules").update({ is_active: isActive }).eq("id", moduleId);
        if (error) throw error;
        return;
      }

      if (!tenantId || !moduleName) throw new Error("Módulo inválido");

      const { error } = await supabase
        .from("restaurant_modules")
        .insert({ restaurant_id: tenantId, module_name: moduleName, is_active: isActive });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", tenantId] });
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
