/**
 * Tenant/Restaurant plan definitions
 */
export type PlanType = 'starter' | 'pro' | 'premium' | 'enterprise';

export interface PlanFeatures {
  customDomain: boolean;
  analytics: boolean;
  api: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  modules: string[];
  maxUsers: number;
  features: PlanFeatures;
  description: string;
}

export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'BRL',
    billingPeriod: 'monthly',
    modules: ['menu'],
    maxUsers: 1,
    features: {
      customDomain: false,
      analytics: false,
      api: false,
      whiteLabel: false,
      prioritySupport: false,
    },
    description: 'Cardápio digital básico para começar',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: 'BRL',
    billingPeriod: 'monthly',
    modules: ['menu', 'waiter_call', 'reservations', 'queue', 'kitchen_order'],
    maxUsers: 5,
    features: {
      customDomain: false,
      analytics: true,
      api: false,
      whiteLabel: false,
      prioritySupport: false,
    },
    description: 'Todos os módulos essenciais para seu restaurante',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 199,
    currency: 'BRL',
    billingPeriod: 'monthly',
    modules: ['*'], // All modules
    maxUsers: 20,
    features: {
      customDomain: true,
      analytics: true,
      api: true,
      whiteLabel: false,
      prioritySupport: true,
    },
    description: 'Solução completa com domínio próprio e API',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    currency: 'BRL',
    billingPeriod: 'monthly',
    modules: ['*'],
    maxUsers: -1, // Unlimited
    features: {
      customDomain: true,
      analytics: true,
      api: true,
      whiteLabel: true,
      prioritySupport: true,
    },
    description: 'Para redes e franquias com múltiplas unidades',
  },
};

/**
 * Tenant role definitions
 */
export type TenantRoleType = 'owner' | 'admin' | 'manager' | 'staff' | 'kitchen' | 'waiter';

export interface TenantRole {
  id: TenantRoleType;
  label: string;
  description: string;
  permissions: string[];
}

export const TENANT_ROLES: Record<TenantRoleType, TenantRole> = {
  owner: {
    id: 'owner',
    label: 'Proprietário',
    description: 'Controle total sobre o estabelecimento',
    permissions: ['*'],
  },
  admin: {
    id: 'admin',
    label: 'Administrador',
    description: 'Gerencia todas as configurações e usuários',
    permissions: ['manage_users', 'manage_settings', 'manage_menu', 'manage_orders', 'view_reports'],
  },
  manager: {
    id: 'manager',
    label: 'Gerente',
    description: 'Gerencia operações do dia-a-dia',
    permissions: ['manage_menu', 'manage_orders', 'view_reports', 'manage_staff'],
  },
  staff: {
    id: 'staff',
    label: 'Funcionário',
    description: 'Acesso básico às operações',
    permissions: ['view_orders', 'update_orders'],
  },
  kitchen: {
    id: 'kitchen',
    label: 'Cozinha',
    description: 'Visualiza e atualiza pedidos da cozinha',
    permissions: ['view_orders', 'update_order_status'],
  },
  waiter: {
    id: 'waiter',
    label: 'Garçom',
    description: 'Atende chamados e gerencia mesas',
    permissions: ['view_tables', 'manage_service_calls', 'view_orders'],
  },
};

/**
 * Get plan by ID
 */
export function getPlan(planId: PlanType | string | null): Plan {
  return PLANS[planId as PlanType] || PLANS.starter;
}

/**
 * Check if plan has access to a module
 */
export function planHasModule(planId: PlanType | string | null, moduleName: string): boolean {
  const plan = getPlan(planId);
  return plan.modules.includes('*') || plan.modules.includes(moduleName);
}

/**
 * Check if plan has a specific feature
 */
export function planHasFeature(planId: PlanType | string | null, feature: keyof PlanFeatures): boolean {
  const plan = getPlan(planId);
  return plan.features[feature];
}
