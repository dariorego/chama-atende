import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type PublicTable = Pick<Tables<"tables">, "id" | "number" | "name" | "status" | "capacity">;

export function usePublicTables() {
  return useQuery({
    queryKey: ["public-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("id, number, name, status, capacity")
        .eq("is_active", true)
        .order("number");
      
      if (error) throw error;
      return data as PublicTable[];
    },
  });
}
