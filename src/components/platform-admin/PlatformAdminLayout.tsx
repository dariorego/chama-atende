import { ReactNode } from 'react';
import { Building2, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

export function PlatformAdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/adminchamaatende/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">Chama-Atende</p>
            <p className="text-xs text-muted-foreground">Administração da plataforma</p>
          </div>
          <nav className="hidden md:block">
            <Button variant={location.pathname === '/adminchamaatende' ? 'secondary' : 'ghost'} size="sm"><LayoutDashboard className="mr-2 h-4 w-4" />Licenças</Button>
          </nav>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair"><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
