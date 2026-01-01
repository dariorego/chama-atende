import { ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading } = useAdminAccess(slug ?? '');

  const isLoading = authLoading || accessLoading;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to admin login page for this establishment
      navigate(`/admin/${slug}/login`, { replace: true });
      return;
    }

    if (requireAdmin && !hasAccess) {
      // User authenticated but doesn't have access to this restaurant
      navigate(`/${slug}`, { replace: true });
    }
  }, [isAuthenticated, hasAccess, isLoading, requireAdmin, navigate, slug]);

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
