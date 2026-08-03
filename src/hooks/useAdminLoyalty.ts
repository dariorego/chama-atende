import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

// ---------- Types ----------
export interface Customer {
  id: string;
  restaurant_id: string;
  name: string | null;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}
export type CustomerInsert = Partial<Omit<Customer, "id" | "restaurant_id" | "created_at" | "updated_at">> & { phone: string };
export type CustomerUpdate = Partial<CustomerInsert> & { id: string };

export interface CustomerLoyaltyBalance {
  id: string;
  customer_id: string;
  restaurant_id: string;
  tier_id: string | null;
  points_balance: number;
  total_earned_lifetime: number;
  total_redeemed_lifetime: number;
  updated_at: string;
  customers?: Customer | null;
  loyalty_tiers?: LoyaltyTier | null;
}

export interface LoyaltyProgram {
  id: string;
  restaurant_id: string;
  points_per_currency: number;
  currency_value_per_point: number;
  welcome_points: number;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}
export type LoyaltyProgramInsert = Partial<Omit<LoyaltyProgram, "id" | "restaurant_id" | "created_at" | "updated_at">>;
export type LoyaltyProgramUpdate = Partial<LoyaltyProgramInsert> & { id: string };

export interface LoyaltyTier {
  id: string;
  restaurant_id: string;
  name: string;
  min_points: number;
  multiplier: number;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
export type LoyaltyTierInsert = Partial<Omit<LoyaltyTier, "id" | "restaurant_id" | "created_at" | "updated_at">> & { name: string };
export type LoyaltyTierUpdate = Partial<LoyaltyTierInsert> & { id: string };

export interface LoyaltyReward {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  points_cost: number;
  discount_type: string;
  discount_value: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type LoyaltyRewardInsert = Partial<Omit<LoyaltyReward, "id" | "restaurant_id" | "created_at" | "updated_at">> & { name: string };
export type LoyaltyRewardUpdate = Partial<LoyaltyRewardInsert> & { id: string };

export interface LoyaltyTransaction {
  id: string;
  restaurant_id: string;
  customer_id: string;
  points: number;
  type: string;
  description: string | null;
  order_id: string | null;
  reward_id: string | null;
  coupon_id: string | null;
  referral_id: string | null;
  created_by: string | null;
  created_at: string;
  customers?: Customer | null;
}
export type LoyaltyTransactionInsert = Partial<Omit<LoyaltyTransaction, "id" | "restaurant_id" | "created_at">> & { customer_id: string; points: number; type: string };

// ---------- Customers ----------
export function useAdminLoyaltyCustomers() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-customers", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: CustomerInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase.from("customers").insert({ ...payload, restaurant_id: tenantId } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-customers", tenantId] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao criar cliente", { description: error.message }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({ id, ...updates }: CustomerUpdate) => {
      const { error } = await supabase.from("customers").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-customers", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-balances", tenantId] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar cliente", { description: error.message }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-customers", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-balances", tenantId] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao excluir cliente", { description: error.message }),
  });
}

// ---------- Balances ----------
export function useAdminLoyaltyBalances() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-balances", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_loyalty_balances")
        .select("*, customers(*), loyalty_tiers(*)")
        .eq("restaurant_id", tenantId!)
        .order("points_balance", { ascending: false });
      if (error) throw error;
      return data as unknown as CustomerLoyaltyBalance[];
    },
  });
}

// ---------- Program ----------
export function useAdminLoyaltyProgram() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-program", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as LoyaltyProgram | null;
    },
  });
}

export function useUpsertLoyaltyProgram() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: { id?: string } & LoyaltyProgramInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      if (payload.id) {
        const { id, ...updates } = payload;
        const { error } = await supabase.from("loyalty_programs").update(updates as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("loyalty_programs").insert({ ...payload, restaurant_id: tenantId } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-program", tenantId] });
      toast.success("Programa salvo com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao salvar programa", { description: error.message }),
  });
}

// ---------- Tiers ----------
export function useAdminLoyaltyTiers() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-tiers", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_tiers")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as LoyaltyTier[];
    },
  });
}

export function useCreateLoyaltyTier() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: LoyaltyTierInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase.from("loyalty_tiers").insert({ ...payload, restaurant_id: tenantId } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-tiers", tenantId] });
      toast.success("Nível criado com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao criar nível", { description: error.message }),
  });
}

export function useUpdateLoyaltyTier() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({ id, ...updates }: LoyaltyTierUpdate) => {
      const { error } = await supabase.from("loyalty_tiers").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-tiers", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-balances", tenantId] });
      toast.success("Nível atualizado com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar nível", { description: error.message }),
  });
}

export function useDeleteLoyaltyTier() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-tiers", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-balances", tenantId] });
      toast.success("Nível excluído com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao excluir nível", { description: error.message }),
  });
}

export function useToggleLoyaltyTierActive() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("loyalty_tiers").update({ is_active } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-tiers", tenantId] });
      toast.success("Status atualizado!");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar status", { description: error.message }),
  });
}

// ---------- Rewards ----------
export function useAdminLoyaltyRewards() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-rewards", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as LoyaltyReward[];
    },
  });
}

export function useCreateLoyaltyReward() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: LoyaltyRewardInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase.from("loyalty_rewards").insert({ ...payload, restaurant_id: tenantId } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-rewards", tenantId] });
      toast.success("Recompensa criada com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao criar recompensa", { description: error.message }),
  });
}

export function useUpdateLoyaltyReward() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({ id, ...updates }: LoyaltyRewardUpdate) => {
      const { error } = await supabase.from("loyalty_rewards").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-rewards", tenantId] });
      toast.success("Recompensa atualizada com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar recompensa", { description: error.message }),
  });
}

export function useDeleteLoyaltyReward() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-rewards", tenantId] });
      toast.success("Recompensa excluída com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao excluir recompensa", { description: error.message }),
  });
}

export function useToggleLoyaltyRewardActive() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("loyalty_rewards").update({ is_active } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-rewards", tenantId] });
      toast.success("Status atualizado!");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar status", { description: error.message }),
  });
}

// ---------- Transactions ----------
export function useAdminLoyaltyTransactions() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["admin-loyalty-transactions", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*, customers(*)")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as LoyaltyTransaction[];
    },
  });
}

export function useCreateLoyaltyTransaction() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: LoyaltyTransactionInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase.from("loyalty_transactions").insert({ ...payload, restaurant_id: tenantId } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-transactions", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-balances", tenantId] });
      toast.success("Transação registrada com sucesso!");
    },
    onError: (error: Error) => toast.error("Erro ao registrar transação", { description: error.message }),
  });
}
