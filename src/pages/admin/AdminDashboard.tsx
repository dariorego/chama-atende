import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAdminModules } from "@/hooks/useAdminModules";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Bell, Calendar, Users, Star, ChefHat, Settings, UserCog, LayoutDashboard, ArrowRight, Music, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const MODULE_CONFIG: Record<string, { label: string; description: string; icon: typeof UtensilsCrossed; href: string; color: string; bgColor: string }> = {
  menu: { label: "Cardápio", description: "Gerenciar produtos e categorias", icon: UtensilsCrossed, href: "produtos", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  waiter_call: { label: "Chamar Atendente", description: "Solicitações de clientes", icon: Bell, href: "atendimentos", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  reservations: { label: "Reservas", description: "Gerenciar reservas", icon: Calendar, href: "reservas", color: "text-green-500", bgColor: "bg-green-500/10" },
  queue: { label: "Fila de Espera", description: "Gerenciar fila", icon: Users, href: "fila", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  customer_review: { label: "Avaliações", description: "Feedback dos clientes", icon: Star, href: "avaliacoes", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  kitchen_order: { label: "Pedidos", description: "Pedidos da cozinha", icon: ChefHat, href: "pedidos", color: "text-red-500", bgColor: "bg-red-500/10" },
};

const QUICK_ACCESS = [
  { label: "Métricas", icon: LayoutDashboard, href: "metricas" },
  { label: "Configurações", icon: Settings, href: "configuracoes" },
  { label: "Usuários", icon: UserCog, href: "usuarios" },
];

// Converte URL do Spotify para formato embed
function getSpotifyEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Já é uma URL de embed
  if (url.includes('open.spotify.com/embed')) {
    return url;
  }
  
  // Converte URL normal para embed
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M -> https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
  const match = url.match(/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  
  return null;
}

export default function AdminDashboard() {
  const { restaurant, isLoading: restaurantLoading, updateRestaurant } = useAdminSettings();
  const { profile, isLoading: profileLoading } = useCurrentUser();
  const { modules, isLoading: modulesLoading } = useAdminModules();
  
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [isEditingSpotify, setIsEditingSpotify] = useState(false);

  useEffect(() => {
    if (restaurant?.social_links?.spotify_playlist) {
      setSpotifyUrl(restaurant.social_links.spotify_playlist);
    }
  }, [restaurant?.social_links?.spotify_playlist]);

  const handleSaveSpotify = () => {
    const embedUrl = getSpotifyEmbedUrl(spotifyUrl);
    if (spotifyUrl && !embedUrl) {
      toast.error("URL do Spotify inválida. Use um link de playlist, álbum ou música.");
      return;
    }
    
    updateRestaurant({
      social_links: {
        ...restaurant?.social_links,
        spotify_playlist: spotifyUrl,
      },
    });
    setIsEditingSpotify(false);
  };

  if (restaurantLoading || profileLoading || modulesLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const activeModules = modules?.filter((m) => m.is_active) || [];
  const spotifyEmbedUrl = getSpotifyEmbedUrl(spotifyUrl);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Olá, {profile?.full_name || "Administrador"}! 👋</h1>
        <p className="text-muted-foreground text-lg">{restaurant?.name}</p>
      </div>

      {/* Spotify Config */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Music className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Música Ambiente</CardTitle>
                <CardDescription>
                  {spotifyEmbedUrl 
                    ? "Player ativo na sidebar (continua tocando ao navegar)" 
                    : "Configure uma playlist do Spotify"}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditingSpotify(!isEditingSpotify)}
            >
              {isEditingSpotify ? "Cancelar" : "Configurar"}
            </Button>
          </div>
        </CardHeader>
        {(isEditingSpotify || !spotifyEmbedUrl) && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Cole a URL do Spotify (playlist, álbum ou música)"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="bg-surface placeholder:text-surface-foreground"
              />
              <Button onClick={handleSaveSpotify} size="icon">
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              O player aparecerá na sidebar e continuará tocando enquanto você navega pelo painel.
            </p>
          </CardContent>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Módulos do Restaurante</h2>
        {activeModules.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum módulo ativo. <Link to="/admin/modulos" className="text-primary underline">Ativar módulos</Link></CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeModules.map((module) => {
              const config = MODULE_CONFIG[module.module_name];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <Link key={module.id} to={`/admin/${config.href}`}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${config.bgColor}`}><Icon className={`h-6 w-6 ${config.color}`} /></div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardTitle className="text-lg mt-3">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Acesso Rápido</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} to={`/admin/${item.href}`}><Button variant="outline" className="gap-2"><Icon className="h-4 w-4" />{item.label}</Button></Link>;
          })}
        </div>
      </div>
    </div>
  );
}
