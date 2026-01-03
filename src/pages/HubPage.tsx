import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ActionCard } from "@/components/ui/action-card";
import {
  UtensilsCrossed,
  Bell,
  CalendarCheck,
  ChefHat,
  Users,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Camera,
  MessageCircle,
  Globe,
  Wifi,
  ChevronLeft,
  Share2,
  Navigation,
  Star,
  Loader2,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useRestaurantModules } from "@/hooks/useRestaurantModules";
import { SocialLinks, WifiInfo, formatTime } from "@/types/restaurant";
import { toast } from "sonner";

const HubPage = () => {
  const [scrolled, setScrolled] = useState(false);

  // Fetch data from Supabase
  const { restaurant, isLoading: isLoadingRestaurant } = useAdminSettings();
  const { data: modules, isLoading: isLoadingModules } = useRestaurantModules();

  const isLoading = isLoadingRestaurant || isLoadingModules;

  // Parse JSONB fields
  const socialLinks = (restaurant?.social_links as SocialLinks) ?? {};
  const wifiInfo = (restaurant?.wifi_info as WifiInfo) ?? {};

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: restaurant?.name ?? '',
        url: window.location.href,
      });
    }
  };

  const copyWifiPassword = () => {
    if (wifiInfo.password) {
      navigator.clipboard.writeText(wifiInfo.password);
      toast.success("Senha do WiFi copiada!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Restaurante não encontrado</p>
      </div>
    );
  }

  const isOpen = restaurant.status === 'open';

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="icon" className="text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span
              className={`font-semibold text-foreground transition-opacity duration-300 ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
            >
              {restaurant.name}
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-foreground" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-20 pb-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent h-80" />

        {/* Content */}
        <div className="relative container mx-auto px-4 max-w-lg">
          {/* Logo with glow */}
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl scale-110" />
              
              {/* Logo container */}
              <div className="relative w-28 h-28 rounded-full border-4 border-primary/40 overflow-hidden shadow-glow">
                {restaurant.logo_url ? (
                  <img
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status badge inside */}
                <div className={`absolute bottom-1 right-1 flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  isOpen ? 'bg-primary' : 'bg-muted'
                }`}>
                  <span className="relative flex h-2 w-2">
                    {isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOpen ? 'bg-primary-foreground' : 'bg-muted-foreground'
                    }`} />
                  </span>
                  <span className={`text-xs font-semibold ${
                    isOpen ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Name and subtitle */}
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {restaurant.name}
            </h1>
            {restaurant.subtitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {restaurant.subtitle}
              </p>
            )}

            {/* Opening hours */}
            {restaurant.closing_time && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Fecha às <span className="text-foreground font-medium">{formatTime(restaurant.closing_time)}</span></span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">Fotos</span>
            </button>
            {restaurant.phone && (
              <a href={`https://wa.me/${restaurant.phone.replace(/\D/g, "")}`} className="flex flex-col items-center gap-1.5 group">
                <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground">Chat</span>
              </a>
            )}
            {socialLinks.website && (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground">Site</span>
              </a>
            )}
            {wifiInfo.password && (
              <button onClick={copyWifiPassword} className="flex flex-col items-center gap-1.5 group">
                <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <Wifi className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground">WiFi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 pb-8 max-w-lg">
        <div className="space-y-3">
          {/* Hero Menu Card */}
          {modules?.menu && (
            <ActionCard
              icon={UtensilsCrossed}
              title="Cardápio Digital"
              description="Explore nosso menu completo com fotos e descrições detalhadas"
              to="/cardapio"
              variant="hero"
              badge="DESTAQUE"
            />
          )}

          {/* Colored Module Cards */}
          {modules?.waiterCall && (
            <ActionCard
              icon={Bell}
              title="Pedir Atendimento"
              description="Solicite atendimento na sua mesa"
              to="/solicitar-atendimento"
              variant="amber"
            />
          )}

          {modules?.reservations && (
            <ActionCard
              icon={CalendarCheck}
              title="Fazer Reserva"
              description="Reserve sua mesa com antecedência"
              to="/reservas"
              variant="purple"
            />
          )}

          {modules?.queue && (
            <ActionCard
              icon={Users}
              title="Fila de Espera"
              description="Entre na fila e acompanhe sua posição"
              to="/fila"
              variant="blue"
            />
          )}

          {modules?.kitchenOrder && (
            <ActionCard
              icon={ChefHat}
              title="Pedido Cozinha"
              description="Monte seu prato personalizado"
              to="/pedido-cozinha"
              variant="rose"
            />
          )}

          {modules?.customerReview && (
            <ActionCard
              icon={Star}
              title="Avaliar Experiência"
              description="Compartilhe sua opinião sobre nosso serviço"
              to="/avaliacao"
              variant="amber"
            />
          )}
        </div>

        {/* Map Card */}
        {restaurant.address && (
          <div className="mt-6">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-border group"
            >
              <div className="relative h-32 bg-secondary">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-medium">{restaurant.address}</p>
                  </div>
                  <Button size="icon" variant="secondary" className="shrink-0">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Social Links */}
        {(socialLinks.instagram || socialLinks.facebook) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary font-medium">RestoPlatform</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <a href="/termos" className="hover:text-primary transition-colors">TERMOS</a>
            <span>•</span>
            <a href="/privacidade" className="hover:text-primary transition-colors">PRIVACIDADE</a>
            <span>•</span>
            <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
              <Settings className="h-3 w-3" />
              ADMIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubPage;
