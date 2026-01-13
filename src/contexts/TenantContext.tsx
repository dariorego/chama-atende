import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useLocation } from 'react-router-dom';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  is_active: boolean | null;
  plan: string | null;
  custom_domain: string | null;
  theme_colors: Record<string, string> | null;
  theme_settings: Record<string, string> | null;
  social_links: Record<string, string> | null;
  wifi_info: Record<string, string> | null;
  business_hours: Record<string, unknown> | null;
  timezone: string | null;
  identification_type: string | null;
  google_maps_url: string | null;
  location_coordinates: Record<string, number> | null;
  notification_settings: Record<string, unknown> | null;
  features: Record<string, boolean> | null;
  max_users: number | null;
}

interface TenantContextValue {
  tenant: Tenant | null;
  tenantId: string | null;
  slug: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

/**
 * Extracts tenant slug from URL
 * Supports both path-based (/dengo/cardapio) and subdomain-based (dengo.domain.com)
 */
function extractSlugFromUrl(): string | null {
  const hostname = window.location.hostname;
  
  // Check for subdomain pattern (e.g., dengo.chamaatende.com)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Exclude common subdomains
    if (!['www', 'app', 'api', 'admin', 'localhost'].includes(subdomain)) {
      return subdomain;
    }
  }
  
  // Fallback: extract from path (handled by useParams in components)
  return null;
}

interface TenantProviderProps {
  children: ReactNode;
  slug?: string; // Can be passed directly or extracted from URL
}

export function TenantProvider({ children, slug: propSlug }: TenantProviderProps) {
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  
  // Priority: prop > URL param > subdomain > path extraction
  const slug = propSlug || params.slug || extractSlugFromUrl() || extractSlugFromPath(location.pathname);

  const {
    data: tenant,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tenant', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error(`Tenant não encontrado: ${slug}`);

      return data as unknown as Tenant;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const value: TenantContextValue = {
    tenant: tenant ?? null,
    tenantId: tenant?.id ?? null,
    slug: slug ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Reserved routes that should NOT be treated as tenant slugs
 */
const RESERVED_ROUTES = [
  'login', 'signup', 'onboarding', 'admin', 'api', 'auth', 
  'settings', 'profile', 'dashboard', 'health', 'status'
];

/**
 * Extract slug from pathname
 * e.g., /dengo/cardapio -> dengo
 */
function extractSlugFromPath(pathname: string): string | null {
  // Skip admin routes
  if (pathname.startsWith('/admin')) {
    const match = pathname.match(/^\/admin\/([^/]+)/);
    return match ? match[1] : null;
  }
  
  // Skip known static routes
  const staticRoutes = ['/', '/login', '/signup', '/onboarding'];
  if (staticRoutes.includes(pathname)) {
    return null;
  }
  
  // Extract first path segment as slug
  const match = pathname.match(/^\/([^/]+)/);
  if (match) {
    const potentialSlug = match[1];
    // Exclude reserved routes - these are NOT tenant slugs
    if (RESERVED_ROUTES.includes(potentialSlug.toLowerCase())) {
      return null;
    }
    return potentialSlug;
  }
  
  return null;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to get tenant slug from URL without full tenant data
 * Useful for initial routing decisions
 */
export function useTenantSlug() {
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  
  return params.slug || extractSlugFromUrl() || extractSlugFromPath(location.pathname);
}
