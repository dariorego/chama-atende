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

export interface NotificationSettings {
  sound_enabled?: boolean;
}

export interface ThemeSettings {
  client_default_theme?: 'light' | 'dark';
  admin_default_theme?: 'light' | 'dark';
}

// Horário de um dia específico
export interface DayHours {
  open: string;      // "HH:MM"
  close: string;     // "HH:MM"
  is_closed: boolean; // true = fechado neste dia
}

// Horários da semana completa
export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// Fusos horários do Brasil disponíveis
export const BRAZIL_TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília / São Paulo (UTC-3)' },
  { value: 'America/Recife', label: 'Recife / Nordeste (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus / Amazonas (UTC-4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá / Mato Grosso (UTC-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco / Acre (UTC-5)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
] as const;

// Mapeamento de dias da semana (começa em domingo = 0)
export const WEEKDAYS = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
] as const;

// Horários padrão
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '11:30', close: '23:00', is_closed: false },
  tuesday: { open: '11:30', close: '23:00', is_closed: false },
  wednesday: { open: '11:30', close: '23:00', is_closed: false },
  thursday: { open: '11:30', close: '23:00', is_closed: false },
  friday: { open: '11:30', close: '23:00', is_closed: false },
  saturday: { open: '11:30', close: '23:00', is_closed: false },
  sunday: { open: '11:30', close: '22:00', is_closed: false },
};

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
