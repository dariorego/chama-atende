import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';
import { useTenantAccess } from './useTenantAccess';
import { ADMIN_ONLY_SECTIONS, SECTION_MODULE } from '@/lib/adminSections';

/**
 * Permissões por módulo do usuário logado no estabelecimento atual.
 * Owner/Admin do estabelecimento têm acesso total.
 */
export function useAdminPermissions() {
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const { isAdmin: isTenantAdmin, hasAccess, isLoading: accessLoading } = useTenantAccess();

  const { data: allowedModules, isLoading: modulesLoading } = useQuery({
    queryKey: ['tenant-user-modules', user?.id, tenantId],
    queryFn: async () => {
      if (!user?.id || !tenantId) return [] as string[];
      const { data, error } = await supabase
        .from('tenant_user_modules')
        .select('module_name')
        .eq('user_id', user.id)
        .eq('restaurant_id', tenantId);

      if (error) {
        console.error('Erro ao carregar permissões de módulo:', error);
        return [] as string[];
      }
      return (data ?? []).map((r) => r.module_name as string);
    },
    enabled: !!user?.id && !!tenantId,
    staleTime: 60_000,
  });

  const modules = allowedModules ?? [];

  const canAccessSection = (section?: string | null) => {
    if (!hasAccess) return false;
    if (isTenantAdmin) return true; // owner/admin = acesso total ao seu slug
    if (!section) return true; // dashboard
    if (ADMIN_ONLY_SECTIONS.includes(section)) return false;
    const moduleName = SECTION_MODULE[section];
    if (!moduleName) return true;
    return modules.includes(moduleName);
  };

  return {
    isTenantAdmin,
    allowedModules: modules,
    canAccessSection,
    isLoading: accessLoading || modulesLoading,
  };
}