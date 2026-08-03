import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

export type CouponType = "percentage" | "fixed";
export type CouponApplyTo = "all" | "category" | "product" | "customer";
export type CouponStatus = "active" | "inactive" | "expired";

export interface Coupon {
  id: string;
  restaurant_id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  max_discount_value: number | null;
  min_order_value: number;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  usage_count: number;
  apply_to: CouponApplyTo;
  target_ids: string[] | null;
  auto_apply: boolean;
  is_first_order_only: boolean;
  status: CouponStatus;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export type CouponInsert = Omit<
  Coupon,
  "id" | "restaurant_id" | "usage_count" | "created_at" | "updated_at"
>;
export type CouponUpdate = Partial<CouponInsert>;

export function useAdminCoupons() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["admin-coupons", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (coupon: CouponInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const payload = { ...coupon, restaurant_id: tenantId };
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) throw error;
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons", tenantId] });
      toast.success("Cupom criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar cupom", { description: error.message });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CouponUpdate & { id: string }) => {
      const { error } = await supabase.from("coupons").update(updates).eq("id", id);
      if (error) throw error;
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons", tenantId] });
      toast.success("Cupom atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar cupom", { description: error.message });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons", tenantId] });
      toast.success("Cupom excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir cupom", { description: error.message });
    },
  });
}

export function useToggleCouponStatus() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CouponStatus }) => {
      const { error } = await supabase.from("coupons").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons", tenantId] });
      toast.success(data.status === "active" ? "Cupom ativado!" : "Cupom desativado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar status do cupom", { description: error.message });
    },
  });
}
