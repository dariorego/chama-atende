import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

interface AllowedTenant {
  slug: string;
  name: string;
}

function AccessDenied({ currentSlug }: { currentSlug: string | null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<AllowedTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('tenant_user_roles')
        .select('restaurant_id, restaurants:restaurant_id(slug, name, is_active)')
        .eq('user_id', user.id);

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
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate(currentSlug ? `/login/${currentSlug}` : '/login', { replace: true });
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

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading } = useAdminAccess();
  const { slug: tenantSlug } = useTenant();

  const isLoading = authLoading || accessLoading;
  const currentSlug = params.slug || tenantSlug || null;

  const getTenantLoginPath = () => {
    const adminMatch = location.pathname.match(/^\/admin\/([^/]+)/);
    return adminMatch?.[1] ? `/login/${adminMatch[1]}` : '/login';
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

  // Authenticated but lacks access to THIS tenant — show explicit denial
  // instead of bouncing back to login (which would loop with the same user).
  if (requireAdmin && !hasAccess) {
    return <AccessDenied currentSlug={currentSlug} />;
  }

  return <>{children}</>;
}