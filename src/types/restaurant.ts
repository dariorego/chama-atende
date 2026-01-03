// Types for JSONB fields from Supabase

export type IdentificationType = 'table' | 'room' | 'phone';

export const IDENTIFICATION_CONFIG: Record<IdentificationType, { 
  label: string; 
  placeholder: string; 
  helpText: string;
}> = {
  table: { 
    label: 'Mesa', 
    placeholder: 'Número da Mesa',
    helpText: 'Usaremos esta informação para entregar seu pedido.'
  },
  room: { 
    label: 'Quarto', 
    placeholder: 'Número do Quarto',
    helpText: 'Usaremos esta informação para entregar seu pedido.'
  },
  phone: { 
    label: 'Telefone', 
    placeholder: '(11) 99999-9999',
    helpText: 'Usaremos para entrar em contato sobre seu pedido.'
  },
};

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface WifiInfo {
  network?: string;
  password?: string;
}

export interface ThemeColors {
  primary?: string;
  background?: string;
  card?: string;
  accent?: string;
}

export interface ModulesMap {
  menu: boolean;
  waiterCall: boolean;
  reservations: boolean;
  queue: boolean;
  kitchenOrder: boolean;
  customerReview: boolean;
}

// Module name mapping from snake_case (DB) to camelCase (frontend)
export const MODULE_NAME_MAP: Record<string, keyof ModulesMap> = {
  'menu': 'menu',
  'waiter_call': 'waiterCall',
  'reservations': 'reservations',
  'queue': 'queue',
  'kitchen_order': 'kitchenOrder',
  'customer_review': 'customerReview',
};

// Format time from database (HH:MM:SS) to display format (HH:MM)
export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.slice(0, 5);
}
