import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LicenseState = 'active' | 'expiring' | 'expired' | 'suspended' | 'unconfigured';

export function getLicenseState(license?: { status: 'active' | 'suspended'; expires_at: string | null } | null): LicenseState {
  if (!license) return 'unconfigured';
  if (license.status === 'suspended') return 'suspended';
  if (!license.expires_at) return 'active';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expires = new Date(`${license.expires_at}T00:00:00`);
  if (expires < today) return 'expired';
  const days = Math.ceil((expires.getTime() - today.getTime()) / 86400000);
  return days <= 7 ? 'expiring' : 'active';
}

export function useTenantLicense(restaurantId?: string | null) {
  const query = useQuery({
    queryKey: ['tenant-license', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase
        .from('restaurant_licenses')
        .select('id, restaurant_id, plan, status, starts_at, expires_at')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return { ...query, state: getLicenseState(query.data) };
}
