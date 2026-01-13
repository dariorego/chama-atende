import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
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
  Package,
  Layers,
  ExternalLink,
  Bell,
  Calendar,
  Star,
  BarChart3,
  LayoutGrid,
  User,
  Music,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useAdminModules } from '@/hooks/useAdminModules';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AdminLayoutProps {
  children: ReactNode;
}

// Converte URL do Spotify para formato embed
function getSpotifyEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  if (url.includes('open.spotify.com/embed')) {
    return url;
  }
  
  const match = url.match(/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  
  return null;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  
  // Base path for admin routes with tenant slug
  const adminBase = `/admin/${slug}`;
  const { logout } = useAuth();
  const { profile } = useCurrentUser();
  const { restaurant } = useAdminAccess();
  const { modules } = useAdminModules();
  const { restaurant: restaurantSettings } = useAdminSettings();
  
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(true);
  
  // Get Spotify URL from settings
  const spotifyUrl = restaurantSettings?.social_links?.spotify_playlist || '';
  const spotifyEmbedUrl = getSpotifyEmbedUrl(spotifyUrl);

  // Get active modules
  const activeModules = modules?.filter((m) => m.is_active) || [];
  const isModuleActive = (moduleName: string) => activeModules.some((m) => m.module_name === moduleName);

  // Build dynamic menu based on active modules
  const moduleMenuItems = [
    { moduleName: 'waiter_call', title: 'Atendimentos', url: `${adminBase}/atendimentos`, icon: Bell },
    { moduleName: 'waiter_call', title: 'Mesas', url: `${adminBase}/mesas`, icon: LayoutGrid },
    { moduleName: 'waiter_call', title: 'Atendentes', url: `${adminBase}/atendentes`, icon: User },
    { moduleName: 'reservations', title: 'Reservas', url: `${adminBase}/reservas`, icon: Calendar },
    { moduleName: 'queue', title: 'Fila', url: `${adminBase}/fila`, icon: Users },
    { moduleName: 'customer_review', title: 'Avaliações', url: `${adminBase}/avaliacoes`, icon: Star },
    { moduleName: 'kitchen_order', title: 'Pedidos', url: `${adminBase}/pedidos`, icon: ChefHat },
    { moduleName: 'pre_orders', title: 'Encomendas', url: `${adminBase}/encomendas`, icon: ShoppingBag },
  ].filter((item) => isModuleActive(item.moduleName));

  // Composição items (subitems of kitchen_order)
  const compositionMenuItems = isModuleActive('kitchen_order') ? [
    { title: 'Itens do Pedido', url: `${adminBase}/itens-pedido`, icon: Package },
    { title: 'Combinações', url: `${adminBase}/combinacoes`, icon: Layers },
  ] : [];

  const menuGroups = [
    {
      label: null,
      items: [
        { title: 'Dashboard', url: adminBase, icon: LayoutDashboard },
      ],
    },
    {
      label: 'Cardápio',
      items: [
        { title: 'Produtos', url: `${adminBase}/produtos`, icon: UtensilsCrossed },
        { title: 'Categorias', url: `${adminBase}/categorias`, icon: FolderTree },
      ],
    },
    ...(moduleMenuItems.length > 0 ? [{
      label: 'Módulos',
      items: moduleMenuItems,
    }] : []),
    ...(compositionMenuItems.length > 0 ? [{
      label: 'Composição',
      items: compositionMenuItems,
    }] : []),
    {
      label: 'Gestão',
      items: [
        { title: 'Métricas', url: `${adminBase}/metricas`, icon: BarChart3 },
        { title: 'Módulos', url: `${adminBase}/modulos`, icon: Puzzle },
        { title: 'Usuários', url: `${adminBase}/usuarios`, icon: Users },
        { title: 'Configurações', url: `${adminBase}/configuracoes`, icon: Settings },
      ],
    },
  ];

  const allMenuItems = menuGroups.flatMap((g) => g.items);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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
                          end={item.url === adminBase}
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
                            end={item.url === adminBase}
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
                      <Link
                        to={`/${slug}`}
                        target="_blank"
                        className="flex items-center gap-2 hover:bg-muted/50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver Site</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Spotify Player - Persistente */}
          {spotifyEmbedUrl && (
            <div className="border-t border-border/50 p-3">
              <button
                onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
                className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <div className="flex items-center gap-2">
                  <Music className="h-3 w-3 text-green-500" />
                  <span>Música Ambiente</span>
                </div>
                {isPlayerExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronUp className="h-3 w-3" />
                )}
              </button>
              {isPlayerExpanded && (
                <iframe
                  src={spotifyEmbedUrl}
                  width="100%"
                  height="80"
                  allow="autoplay; clipboard-write; encrypted-media"
                  loading="lazy"
                  className="rounded-lg"
                  title="Spotify Player"
                />
              )}
            </div>
          )}

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
            <h1 className="font-semibold flex-1">
              {allMenuItems.find((item) => 
                location.pathname === item.url || 
                (item.url !== adminBase && location.pathname.startsWith(item.url))
              )?.title ?? 'Dashboard'}
            </h1>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
