/** Utilitários de custo e CMV do módulo Ficha Técnica. */

export const brl = (v?: number | null) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const num3 = (v?: number | null) =>
  (v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export const pct = (v?: number | null) =>
  `${((v ?? 0) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export type CmvLevel = "INCENTIVAR" | "SAUDAVEL" | "AJUSTAR" | "SEM_PRECO";

export interface CmvRuler {
  low: number;
  high: number;
}

export const DEFAULT_RULER: CmvRuler = { low: 0.25, high: 0.3 };

export function cmvLevel(cmv?: number | null, ruler: CmvRuler = DEFAULT_RULER): CmvLevel {
  if (!cmv || !Number.isFinite(cmv)) return "SEM_PRECO";
  if (cmv < ruler.low) return "INCENTIVAR";
  if (cmv <= ruler.high) return "SAUDAVEL";
  return "AJUSTAR";
}

export const CMV_LEVEL_INFO: Record<CmvLevel, { label: string; className: string }> = {
  INCENTIVAR: { label: "Incentivar venda", className: "bg-primary/15 text-primary border-primary/30" },
  SAUDAVEL: { label: "Saudável", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  AJUSTAR: { label: "Ajustar produto", className: "bg-destructive/15 text-destructive border-destructive/30" },
  SEM_PRECO: { label: "Sem preço", className: "bg-muted text-muted-foreground border-border" },
};

export const TREATMENT_TAGS = [
  "VENDA AGREGADA",
  "AJUSTE",
  "EM ANÁLISE",
  "SAÍDA",
  "CONFERIR VALOR DE COMPRA",
] as const;

/** Normaliza texto para busca sem acento e sem diferenciar caixa. */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Custo por porção = custo total / rendimento. */
export function portionCost(totalCost: number, yieldQty: number) {
  return yieldQty > 0 ? totalCost / yieldQty : 0;
}

/** Preço sugerido = custo direto / CMV alvo. */
export function suggestedPrice(directCost: number, targetCmv: number) {
  return targetCmv > 0 ? directCost / targetCmv : 0;
}

/** CMV aplicado = custo direto / preço praticado. */
export function appliedCmv(directCost: number, sellingPrice?: number | null) {
  return sellingPrice && sellingPrice > 0 ? directCost / sellingPrice : null;
}