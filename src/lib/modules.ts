import type { ModulesMap } from '@/types/restaurant';

/**
 * Modules that are customer-facing and do NOT require the user to be physically
 * at a table/room inside the establishment. These are the modules shown when the
 * hub is accessed through the "bio" link (e.g., Instagram bio).
 */
export const EXTERNAL_CUSTOMER_MODULES: Array<keyof ModulesMap> = [
  'menu',          // Cardápio Digital
  'reservations',  // Fazer Reserva
  'queue',         // Fila de Espera
  'preOrders',     // Fazer Encomenda
  'customerReview',// Avaliar Experiência
  'eventBookings', // Reserva de Eventos
];

export const MODULE_LABELS: Record<keyof ModulesMap, string> = {
  menu: 'Cardápio Digital',
  waiterCall: 'Chamar Atendimento',
  reservations: 'Fazer Reserva',
  queue: 'Fila de Espera',
  kitchenOrder: 'Pedido Cozinha',
  customerReview: 'Avaliar Experiência',
  preOrders: 'Fazer Encomenda',
  vitrineDigital: 'Vitrine Digital',
  digitalComanda: 'Comanda Digital',
  eventBookings: 'Reserva de Eventos',
  staffSchedule: 'Agenda de Funcionários',
  whatsappAi: 'WhatsApp AI',
  loyaltyCashback: 'Fidelidade e Cashback',
  coupons: 'Cupons e Promoções',
  referralProgram: 'Programa de Indicação',
  technicalSheet: 'Ficha Técnica',
  hygieneChecklists: 'Checklists de Higiene',
};

export function isExternalModule(moduleName: keyof ModulesMap): boolean {
  return EXTERNAL_CUSTOMER_MODULES.includes(moduleName);
}

export function filterModulesForExternal(
  modules: Partial<ModulesMap> | null | undefined,
): Partial<ModulesMap> {
  if (!modules) return {};
  const result: Partial<ModulesMap> = {};
  for (const key of EXTERNAL_CUSTOMER_MODULES) {
    if (modules[key]) {
      result[key] = true;
    }
  }
  return result;
}
