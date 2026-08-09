import { MODULE_INFO } from "@/hooks/useAdminModules";

/**
 * Segmentos de rota do painel admin. Nunca devem ser interpretados como slug
 * de estabelecimento (ex.: /admin/atendimentos).
 */
export const ADMIN_SECTIONS = [
  "produtos",
  "categorias",
  "importar",
  "modulos",
  "usuarios",
  "configuracoes",
  "atendimentos",
  "mesas",
  "atendentes",
  "reservas",
  "fila",
  "avaliacoes",
  "pedidos",
  "itens-pedido",
  "combinacoes",
  "metricas",
  "encomendas",
  "vitrine",
  "comandas",
  "eventos",
  "agenda",
  "whatsapp",
  "fidelidade",
  "cupons",
  "indicacao",
  "insumos",
  "fichas",
  "desperdicio",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export function isAdminSection(value?: string | null): boolean {
  if (!value) return false;
  return (ADMIN_SECTIONS as readonly string[]).includes(value.toLowerCase());
}

/** Seções acessíveis apenas por owner/admin do estabelecimento. */
export const ADMIN_ONLY_SECTIONS: string[] = ["modulos", "usuarios", "configuracoes", "importar", "whatsapp"];

/** Mapeia cada seção do admin para o módulo de permissão correspondente. */
export const SECTION_MODULE: Record<string, string> = {
  produtos: "menu",
  categorias: "menu",
  atendimentos: "waiter_call",
  mesas: "waiter_call",
  atendentes: "waiter_call",
  reservas: "reservations",
  fila: "queue",
  avaliacoes: "customer_review",
  pedidos: "kitchen_order",
  "itens-pedido": "kitchen_order",
  combinacoes: "kitchen_order",
  encomendas: "pre_orders",
  vitrine: "vitrine_digital",
  comandas: "digital_comanda",
  eventos: "event_bookings",
  agenda: "staff_schedule",
  whatsapp: "whatsapp_ai",
  metricas: "metrics",
  fidelidade: "loyalty_cashback",
  cupons: "coupons",
  indicacao: "referral_program",
  insumos: "technical_sheet",
  fichas: "technical_sheet",
  desperdicio: "technical_sheet",
};

/** Módulos que podem ser concedidos a um usuário na tela Usuários. */
export const PERMISSION_MODULES: { name: string; label: string; description: string }[] = [
  ...Object.entries(MODULE_INFO).map(([name, info]) => ({
    name,
    label: info.label,
    description: info.description,
  })),
  { name: "metrics", label: "Métricas", description: "Painel de métricas e relatórios" },
];

export const PERMISSION_MODULE_LABELS: Record<string, string> = PERMISSION_MODULES.reduce(
  (acc, m) => ({ ...acc, [m.name]: m.label }),
  {} as Record<string, string>
);