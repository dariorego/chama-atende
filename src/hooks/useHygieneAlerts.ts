import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import {
  SHIFT_LABELS,
  buildItemMap,
  daysUntil,
  openNonConformities,
  shelfSeverity,
  today,
  useHygieneChecklists,
  useHygieneRuns,
  useShelfLifeItems,
  type NonConformity,
} from "@/hooks/useHygiene";

const LOOKBACK_DAYS = 7;
const POLL_MS = 30_000;

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Alertas em tempo real de higiene: assina as tabelas do módulo, mantém as
 * queries sincronizadas (com polling de segurança) e notifica o painel quando
 * surge uma não conformidade sem ação corretiva ou uma validade crítica.
 */
export function useHygieneAlerts(enabled = true) {
  const queryClient = useQueryClient();
  const { playNotificationSound } = useNotificationSound();
  const soundRef = useRef(playNotificationSound);
  soundRef.current = playNotificationSound;

  const from = useMemo(() => daysAgo(LOOKBACK_DAYS), []);
  const to = today();

  const { data: checklists = [] } = useHygieneChecklists({ enabled });
  const { data: runs = [] } = useHygieneRuns(from, to, "ALL", {
    enabled,
    refetchInterval: enabled ? POLL_MS : undefined,
  });
  const { data: shelfItems = [] } = useShelfLifeItems("ATIVO", {
    enabled,
    refetchInterval: enabled ? POLL_MS : undefined,
  });

  const itemMap = useMemo(() => buildItemMap(checklists), [checklists]);
  const open = useMemo<NonConformity[]>(
    () => (enabled ? openNonConformities(runs, itemMap) : []),
    [enabled, runs, itemMap],
  );

  const criticalShelf = useMemo(
    () =>
      enabled
        ? shelfItems.filter((item) => shelfSeverity(item.expires_at) !== "ok")
        : [],
    [enabled, shelfItems],
  );

  /* --------------------------- Realtime + polling --------------------------- */
  useEffect(() => {
    if (!enabled) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["hyg-runs"] });
      queryClient.invalidateQueries({ queryKey: ["hyg-shelf"] });
    };

    const channelName = `hygiene-alerts-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "hygiene_checklist_answers" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "hygiene_checklist_runs" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "hygiene_shelf_life_items" }, invalidate)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") invalidate();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  /* ------------------------ Toast + som para novas NC ----------------------- */
  const knownNc = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const keys = open.map((nc) => nc.key);
    if (knownNc.current === null) {
      knownNc.current = new Set(keys);
      return;
    }
    const fresh = open.filter((nc) => !knownNc.current!.has(nc.key));
    knownNc.current = new Set(keys);
    if (fresh.length === 0) return;

    for (const nc of fresh.slice(0, 3)) {
      toast.error(`Não conformidade: ${nc.item_label}`, {
        description: [
          `${nc.checklist_name} · ${SHIFT_LABELS[nc.shift]}`,
          nc.kind === "NUMERICO"
            ? `Valor ${nc.value_label}${nc.range_text ? ` · ${nc.range_text}` : ""}`
            : "Item marcado como não conforme",
          "Ação corretiva pendente",
        ].join(" — "),
        duration: 10000,
      });
    }
    if (fresh.length > 3) {
      toast.error(`+${fresh.length - 3} não conformidades sem ação corretiva`);
    }
    soundRef.current();
  }, [enabled, open]);

  /* -------------------- Toast para validades críticas ---------------------- */
  const knownShelf = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const keys = criticalShelf.map((i) => i.id);
    if (knownShelf.current === null) {
      knownShelf.current = new Set(keys);
      return;
    }
    const fresh = criticalShelf.filter((i) => !knownShelf.current!.has(i.id));
    knownShelf.current = new Set(keys);
    for (const item of fresh.slice(0, 3)) {
      const diff = daysUntil(item.expires_at);
      toast.warning(`Validade: ${item.product_name}`, {
        description:
          diff < 0
            ? `Vencido há ${Math.abs(diff)} dia(s)`
            : diff === 0
              ? "Vence hoje"
              : `Vence em ${diff} dia(s)`,
        duration: 8000,
      });
    }
    if (fresh.length > 0) soundRef.current();
  }, [enabled, criticalShelf]);

  return {
    openNonConformities: open,
    openCount: open.length,
    criticalShelfCount: criticalShelf.length,
    alertCount: open.length + criticalShelf.length,
  };
}
