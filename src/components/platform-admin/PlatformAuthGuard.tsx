import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Button } from '@/components/ui/button';

export function PlatformAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const { isPlatformAdmin, isLoading } = usePlatformAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/adminchamaatende/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  if (loading || isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAuthenticated) return null;
  if (!isPlatformAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-background p-6">
        <section className="w-full max-w-md border border-border bg-card p-8 text-center shadow-card rounded-lg">
          <ShieldX className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sua conta não está na lista de administradores da plataforma.</p>
          <Button className="mt-6 w-full" onClick={() => navigate('/')}>Voltar ao início</Button>
        </section>
      </main>
    );
  }
  return <>{children}</>;
}

export function PlatformLoginRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isAuthenticated) return <Navigate to="/adminchamaatende" replace />;
  return null;
}
