import { useTenant } from '@/contexts/TenantContext';
import { getPlan, planHasModule, planHasFeature, PlanFeatures } from '@/types/tenant';

/**
 * Hook to check if current tenant has access to features/modules
 */
export function useFeatureGate() {
  const { tenant } = useTenant();
  const plan = getPlan(tenant?.plan);

  /**
   * Check if tenant has access to a specific module
   */
  const hasModule = (moduleName: string): boolean => {
    if (!tenant) return false;
    return planHasModule(tenant.plan, moduleName);
  };

  /**
   * Check if tenant has a specific feature
   */
  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (!tenant) return false;
    return planHasFeature(tenant.plan, feature);
  };

  /**
   * Check if tenant can add more users
   */
  const canAddUsers = (currentUserCount: number): boolean => {
    if (!tenant) return false;
    if (plan.maxUsers === -1) return true; // Unlimited
    return currentUserCount < plan.maxUsers;
  };

  /**
   * Get remaining user slots
   */
  const remainingUserSlots = (currentUserCount: number): number => {
    if (!tenant) return 0;
    if (plan.maxUsers === -1) return Infinity;
    return Math.max(0, plan.maxUsers - currentUserCount);
  };

  return {
    plan,
    hasModule,
    hasFeature,
    canAddUsers,
    remainingUserSlots,
    isFreePlan: plan.id === 'starter',
    isPaidPlan: plan.price > 0,
  };
}
