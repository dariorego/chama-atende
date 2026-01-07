import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "restaurant_table_context";
const EXPIRATION_HOURS = 8;

interface TableData {
  id: string;
  number: number;
  name: string | null;
  capacity: number | null;
}

interface StoredTableContext {
  tableId: string;
  tableNumber: number;
  tableName: string | null;
  setAt: string;
}

interface TableContextReturn {
  table: TableData | null;
  tableNumber: number | null;
  tableName: string | null;
  hasTable: boolean;
  isLoading: boolean;
  setTable: (tableId: string) => Promise<boolean>;
  clearTable: () => void;
}

const getStoredContext = (): StoredTableContext | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const context: StoredTableContext = JSON.parse(stored);
    
    // Check expiration
    const setAt = new Date(context.setAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - setAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > EXPIRATION_HOURS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return context;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const useTableContext = (): TableContextReturn => {
  const [table, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadStoredTable = async () => {
      const stored = getStoredContext();
      
      if (stored) {
        // Validate table still exists and is active
        const { data } = await supabase
          .from("tables")
          .select("id, number, name, capacity")
          .eq("id", stored.tableId)
          .eq("is_active", true)
          .maybeSingle();

        if (data) {
          setTableData(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      
      setIsLoading(false);
    };

    loadStoredTable();
  }, []);

  const setTable = useCallback(async (tableId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("tables")
        .select("id, number, name, capacity")
        .eq("id", tableId)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        setIsLoading(false);
        return false;
      }

      // Store in localStorage
      const context: StoredTableContext = {
        tableId: data.id,
        tableNumber: data.number,
        tableName: data.name,
        setAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));

      setTableData(data);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, []);

  const clearTable = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTableData(null);
  }, []);

  return {
    table,
    tableNumber: table?.number ?? null,
    tableName: table?.name ?? null,
    hasTable: !!table,
    isLoading,
    setTable,
    clearTable,
  };
};
