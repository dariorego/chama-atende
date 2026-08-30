import { useCallback, useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";

const STORAGE_PREFIX = "customer_name";
export const MAX_CUSTOMER_NAME = 60;

function storageKey(scope: string | null) {
  return `${STORAGE_PREFIX}:${scope ?? "default"}`;
}

export function sanitizeCustomerName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_CUSTOMER_NAME);
}

/**
 * Nome informado pelo cliente no próprio celular. Fica salvo por
 * estabelecimento (slug) e é reutilizado em todos os chamados feitos
 * a partir deste dispositivo.
 */
export function useCustomerName() {
  const { slug } = useTenant();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    try {
      setName(localStorage.getItem(storageKey(slug)));
    } catch {
      setName(null);
    }
  }, [slug]);

  const saveName = useCallback(
    (value: string) => {
      const clean = sanitizeCustomerName(value);
      try {
        if (clean) localStorage.setItem(storageKey(slug), clean);
        else localStorage.removeItem(storageKey(slug));
      } catch {
        /* ignore */
      }
      setName(clean || null);
      return clean || null;
    },
    [slug],
  );

  const clearName = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(slug));
    } catch {
      /* ignore */
    }
    setName(null);
  }, [slug]);

  return { customerName: name, saveName, clearName };
}
