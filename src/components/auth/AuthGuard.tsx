import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useTenant } from '@/hooks/useTenant';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { isAdminSection } from '@/lib/adminSections';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert, Lock, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  /** Seção do admin (ex.: 'atendimentos') usada para checar permissão por módulo. */
  section?: string;
}

interface AllowedTenant {
  slug: string;
  name: string;
}

function useMyTenants(userId?: string) {
  const [tenants, setTenants] = useState<AllowedTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('tenant_user_roles')
        .select('restaurant_id, restaurants:restaurant_id(slug, name, is_active)')
        .eq('user_id', userId);

      if (cancelled) return;
      const list = (data ?? [])
        .map((r: any) => r.restaurants)
        .filter((t: any) => t && t.is_active)
        .map((t: any) => ({ slug: t.slug, name: t.name }));
      setTenants(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { tenants, loading };
}

/**
 * Slug inexistente na URL (ex.: /admin/atendimentos, onde "atendimentos" é uma
 * seção do painel e não um estabelecimento). Redireciona para o painel correto.
 */
function TenantNotFound({ slug }: { slug: string | null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tenants, loading } = useMyTenants(user?.id);
  const sectionSuffix = isAdminSection(slug) ? `/${slug}` : '';

  useEffect(() => {
    if (loading) return;
    if (tenants.length === 1) {
      navigate(`/admin/${tenants[0].slug}${sectionSuffix}`, { replace: true });
    }
  }, [loading, tenants, navigate, sectionSuffix]);

  if (loading || tenants.length === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Estabelecimento não encontrado</h1>
          <p className="text-sm text-muted-foreground">
            Não existe estabelecimento com o endereço {slug ? `"${slug}"` : 'informado'}.
            Escolha um dos seus painéis abaixo.
          </p>
        </div>

        {tenants.length > 0 ? (
          <div className="space-y-1.5 text-left">
            {tenants.map((t) => (
              <Link
                key={t.slug}
                to={`/admin/${t.slug}${sectionSuffix}`}
                className="block w-full px-3 py-2 rounded-md bg-surface hover:bg-surface/70 border border-border text-sm text-foreground transition"
              >
                {t.name} <span className="text-muted-foreground">/{t.slug}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sua conta ainda não está vinculada a nenhum estabelecimento.
          </p>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
          Início
        </Button>
      </div>
    </div>
  );
}

function NoModulePermission({ slug }: { slug: string | null }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Permissão insuficiente</h1>
          <p className="text-sm text-muted-foreground">
            Seu usuário não tem permissão para este módulo. Solicite ao administrador do
            estabelecimento a liberação em Usuários.
          </p>
        </div>
        <Button className="w-full" onClick={() => navigate(slug ? `/admin/${slug}` : '/')}>
          Voltar ao painel
        </Button>
      </div>
    </div>
  );
}

function AccessDenied({ currentSlug }: { currentSlug: string | null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tenants, loading } = useMyTenants(user?.id);

  const handleLogout = async () => {
    await logout();
    navigate(currentSlug ? `/login/${currentSlug}` : '/estabelecimentos?admin=1', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Acesso não autorizado</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta não tem permissão para acessar o painel deste estabelecimento
            {currentSlug ? ` (${currentSlug})` : ''}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tenants.length > 0 ? (
          <div className="space-y-2 text-left">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Você tem acesso a:
            </p>
            <div className="space-y-1.5">
              {tenants.map((t) => (
                <Link
                  key={t.slug}
                  to={`/admin/${t.slug}`}
                  className="block w-full px-3 py-2 rounded-md bg-surface hover:bg-surface/70 border border-border text-sm text-foreground transition"
                >
                  {t.name} <span className="text-muted-foreground">/{t.slug}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sua conta ainda não está vinculada a nenhum estabelecimento.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
            Início
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AuthGuard({ children, requireAdmin = false, section }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading } = useAdminAccess();
  const { slug: tenantSlug, tenant, isLoading: tenantLoading } = useTenant();
  const { canAccessSection, isLoading: permissionsLoading } = useAdminPermissions();

  const isLoading = authLoading || accessLoading || tenantLoading;
  const currentSlug = params.slug || tenantSlug || null;

  const getTenantLoginPath = () => {
    const adminMatch = location.pathname.match(/^\/admin\/([^/]+)/);
    return adminMatch?.[1] ? `/login/${adminMatch[1]}` : '/estabelecimentos?admin=1';
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate(getTenantLoginPath(), {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Slug inexistente (ex.: /admin/atendimentos) — leva ao painel correto.
  if (requireAdmin && !tenant) {
    return <TenantNotFound slug={currentSlug} />;
  }

  // Authenticated but lacks access to THIS tenant — show explicit denial
  // instead of bouncing back to login (which would loop with the same user).
  if (requireAdmin && !hasAccess) {
    return <AccessDenied currentSlug={currentSlug} />;
  }

  if (requireAdmin && permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAdmin && !canAccessSection(section)) {
    return <NoModulePermission slug={currentSlug} />;
  }

  return <>{children}</>;
}