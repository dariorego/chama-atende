import { ReactNode } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Settings,
  Puzzle,
  Users,
  LogOut,
  ChefHat,
  ExternalLink,
  Bell,
  Calendar,
  Star,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useAdminModules } from '@/hooks/useAdminModules';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { profile } = useCurrentUser();
  const { restaurant } = useAdminAccess(slug ?? '');
  const { modules } = useAdminModules();

  // Get active modules
  const activeModules = modules?.filter((m) => m.is_active) || [];
  const isModuleActive = (moduleName: string) => activeModules.some((m) => m.module_name === moduleName);

  // Build dynamic menu based on active modules
  const moduleMenuItems = [
    { moduleName: 'waiter_call', title: 'Atendimentos', url: `/admin/${slug}/atendimentos`, icon: Bell },
    { moduleName: 'reservations', title: 'Reservas', url: `/admin/${slug}/reservas`, icon: Calendar },
    { moduleName: 'queue', title: 'Fila', url: `/admin/${slug}/fila`, icon: Users },
    { moduleName: 'customer_review', title: 'Avaliações', url: `/admin/${slug}/avaliacoes`, icon: Star },
    { moduleName: 'kitchen_order', title: 'Pedidos', url: `/admin/${slug}/pedidos`, icon: ChefHat },
  ].filter((item) => isModuleActive(item.moduleName));

  const menuGroups = [
    {
      label: null,
      items: [
        { title: 'Dashboard', url: `/admin/${slug}`, icon: LayoutDashboard },
      ],
    },
    {
      label: 'Cardápio',
      items: [
        { title: 'Produtos', url: `/admin/${slug}/produtos`, icon: UtensilsCrossed },
        { title: 'Categorias', url: `/admin/${slug}/categorias`, icon: FolderTree },
      ],
    },
    ...(moduleMenuItems.length > 0 ? [{
      label: 'Módulos',
      items: moduleMenuItems,
    }] : []),
    {
      label: 'Gestão',
      items: [
        { title: 'Métricas', url: `/admin/${slug}/metricas`, icon: BarChart3 },
        { title: 'Módulos', url: `/admin/${slug}/modulos`, icon: Puzzle },
        { title: 'Usuários', url: `/admin/${slug}/usuarios`, icon: Users },
        { title: 'Configurações', url: `/admin/${slug}/configuracoes`, icon: Settings },
      ],
    },
  ];

  const allMenuItems = menuGroups.flatMap((g) => g.items);

  const handleLogout = async () => {
    await logout();
    navigate(`/admin/${slug}/login`, { replace: true });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="border-b border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                {restaurant?.logo_url ? (
                  <img 
                    src={restaurant.logo_url} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ChefHat className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">
                  {restaurant?.name ?? 'Carregando...'}
                </h2>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuGroups[0].items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === `/admin/${slug}`}
                          className="flex items-center gap-2 hover:bg-muted/50"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {menuGroups.slice(1).map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === `/admin/${slug}`}
                            className="flex items-center gap-2 hover:bg-muted/50"
                            activeClassName="bg-primary/10 text-primary font-medium"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarGroup>
              <SidebarGroupLabel>Links Rápidos</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:bg-muted/50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver Site</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(profile?.full_name ?? null)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name ?? 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <h1 className="font-semibold">
              {allMenuItems.find((item) => 
                location.pathname === item.url || 
                (item.url !== `/admin/${slug}` && location.pathname.startsWith(item.url))
              )?.title ?? 'Dashboard'}
            </h1>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
