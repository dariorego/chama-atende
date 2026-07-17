import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading } = useAdminAccess();

  const isLoading = authLoading || accessLoading;

  const getTenantLoginPath = () => {
    const adminMatch = location.pathname.match(/^\/admin\/([^/]+)/);
    return adminMatch?.[1] ? `/login/${adminMatch[1]}` : '/login';
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Preserve current URL to redirect back after login
      navigate(getTenantLoginPath(), { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }

    if (requireAdmin && !hasAccess) {
      navigate(getTenantLoginPath(), {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, hasAccess, isLoading, requireAdmin, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireAdmin && !hasAccess) return null;

  return <>{children}</>;
}
