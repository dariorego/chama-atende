import { supabase } from "@/integrations/supabase/client";

/**
 * Chama a Edge Function `public-api` responsável pelos acessos públicos
 * (leitura de status, cancelamentos, etc.). Substitui as chamadas diretas
 * ao banco após restringirmos as políticas RLS a administradores.
 */
export async function callPublicApi<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("public-api", {
    body: { action, ...params },
  });
  if (error) throw error;
  if (data && typeof data === "object" && "error" in (data as any) && (data as any).error) {
    throw new Error(String((data as any).error));
  }
  return data as T;
}