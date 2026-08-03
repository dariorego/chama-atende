import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

// ---------- Types ----------
export interface ReferralProgram {
  id: string;
  restaurant_id: string;
  referrer_reward_type: string;
  referrer_reward_value: number;
  referred_discount_type: string;
  referred_discount_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ReferralProgramInsert = Omit<ReferralProgram, "id" | "created_at" | "updated_at" | "restaurant_id">;
export type ReferralProgramUpdate = Partial<ReferralProgramInsert>;

export interface ReferralCode {
  id: string;
  restaurant_id: string;
  customer_id: string;
  code: string;
  referral_link: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  customers?: { name: string | null; phone: string } | null;
}

export type ReferralCodeInsert = {
  customer_id: string;
  code: string;
  referral_link?: string | null;
};
export type ReferralCodeUpdate = Partial<ReferralCodeInsert>;

export interface Referral {
  id: string;
  restaurant_id: string;
  referrer_code_id: string;
  referred_customer_id: string | null;
  referred_customer_phone: string | null;
  referred_order_id: string | null;
  referred_pre_order_id: string | null;
  referred_comanda_id: string | null;
  status: string;
  reward_applied: boolean;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  referral_codes?: { code: string; customer_id: string } | null;
  referred_customer?: { name: string | null; phone: string } | null;
}

export type ReferralInsert = {
  referrer_code_id: string;
  referred_customer_id?: string | null;
  referred_customer_phone?: string | null;
  status?: string;
};
export type ReferralUpdate = Partial<ReferralInsert> & { reward_applied?: boolean; converted_at?: string | null };

// ---------- Referral Programs ----------
export function useAdminReferralPrograms() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["admin-referral-programs", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_programs")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReferralProgram[];
    },
  });
}

export function useCreateReferralProgram() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (program: ReferralProgramInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase
        .from("referral_programs")
        .insert({ ...program, restaurant_id: tenantId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-programs", tenantId] });
      toast.success("Programa de indicação criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar programa: " + error.message);
    },
  });
}

export function useUpdateReferralProgram() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ReferralProgramUpdate & { id: string }) => {
      const { error } = await supabase
        .from("referral_programs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-programs", tenantId] });
      toast.success("Programa atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar programa: " + error.message);
    },
  });
}

export function useDeleteReferralProgram() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("referral_programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-programs", tenantId] });
      toast.success("Programa excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir programa: " + error.message);
    },
  });
}

export function useToggleReferralProgramActive() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("referral_programs")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-programs", tenantId] });
      toast.success("Status do programa atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });
}

// ---------- Referral Codes ----------
export function useAdminReferralCodes() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["admin-referral-codes", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*, customers(name, phone)")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as ReferralCode[];
    },
  });
}

export function useCreateReferralCode() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (code: ReferralCodeInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase
        .from("referral_codes")
        .insert({ ...code, restaurant_id: tenantId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes", tenantId] });
      toast.success("Código de indicação criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar código: " + error.message);
    },
  });
}

export function useUpdateReferralCode() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ReferralCodeUpdate & { id: string }) => {
      const { error } = await supabase
        .from("referral_codes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes", tenantId] });
      toast.success("Código atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar código: " + error.message);
    },
  });
}

export function useDeleteReferralCode() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("referral_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes", tenantId] });
      toast.success("Código excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir código: " + error.message);
    },
  });
}

// ---------- Referrals ----------
export function useAdminReferrals() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["admin-referrals", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_referrals")
        .select("*, referral_codes(code, customer_id), referred_customer:customers!referral_referrals_referred_customer_id_fkey(name, phone)")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Referral[];
    },
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (referral: ReferralInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { error } = await supabase
        .from("referral_referrals")
        .insert({ ...referral, restaurant_id: tenantId, status: referral.status || "pending" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals", tenantId] });
      toast.success("Indicação registrada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao registrar indicação: " + error.message);
    },
  });
}

export function useUpdateReferral() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ReferralUpdate & { id: string }) => {
      const { error } = await supabase
        .from("referral_referrals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals", tenantId] });
      toast.success("Indicação atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar indicação: " + error.message);
    },
  });
}

export function useUpdateReferralStatus() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "converted" | "expired" | "cancelled" }) => {
      const updates: { status: string; converted_at?: string | null; reward_applied?: boolean } = { status };
      if (status === "converted") {
        updates.converted_at = new Date().toISOString();
        updates.reward_applied = true;
      }
      const { error } = await supabase
        .from("referral_referrals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals", tenantId] });
      toast.success("Status da indicação atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });
}

export function useDeleteReferral() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("referral_referrals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals", tenantId] });
      toast.success("Indicação excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir indicação: " + error.message);
    },
  });
}
