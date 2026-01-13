import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
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
  X,
  ShoppingBag,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";
import { useRestaurantModules } from "@/hooks/useRestaurantModules";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import { useTableContext } from "@/hooks/useTableContext";
import { SocialLinks, WifiInfo, LocationCoordinates, BusinessHours } from "@/types/restaurant";
import { toast } from "sonner";
import { generateGoogleMapsUrl } from "@/lib/google-maps-utils";

const HubPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [scrolled, setScrolled] = useState(false);

  // Use TenantContext instead of useAdminSettings
  const { tenant, isLoading: isLoadingTenant, error: tenantError } = useTenant();
  const { data: modules, isLoading: isLoadingModules } = useRestaurantModules();
  const { table, tableNumber, tableName, hasTable, isLoading: isLoadingTable, setTable, clearTable } = useTableContext();

  const isLoading = isLoadingTenant || isLoadingModules || isLoadingTable;

  // Capture table from URL parameter
  const mesaParam = searchParams.get("mesa");
  
  useEffect(() => {
    if (mesaParam && slug) {
      setTable(mesaParam).then((success) => {
        if (success) {
          toast.success("Mesa identificada com sucesso!");
          // Remove parameter from URL, keep slug
          navigate(`/${slug}`, { replace: true });
        } else {
          toast.error("Mesa não encontrada ou inativa");
          navigate(`/${slug}`, { replace: true });
        }
      });
    }
  }, [mesaParam, setTable, navigate, slug]);

  // Parse JSONB fields from tenant
  const socialLinks = (tenant?.social_links as SocialLinks) ?? {};
  const wifiInfo = (tenant?.wifi_info as WifiInfo) ?? {};
  const locationCoordinates = (tenant?.location_coordinates as unknown as LocationCoordinates) ?? null;
  
  // Calculate automatic status based on business hours
  const businessHours = (tenant?.business_hours as unknown) as BusinessHours | null;
  const { isOpen, statusText } = useRestaurantStatus(
    businessHours || undefined,
    tenant?.timezone || 'America/Sao_Paulo'
  );

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
        title: tenant?.name ?? '',
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

  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {tenantError?.message || 'Estabelecimento não encontrado'}
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  // Build routes with slug prefix
  const buildRoute = (path: string) => `/${slug}${path}`;

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
            <Button variant="ghost" size="icon" className="text-foreground" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span
              className={`font-semibold text-foreground transition-opacity duration-300 ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
            >
              {tenant.name}
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
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Name and subtitle */}
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {tenant.name}
            </h1>
            {tenant.subtitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {tenant.subtitle}
              </p>
            )}

            {/* Status badge - dynamic based on business hours */}
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                isOpen 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="relative flex h-2 w-2">
                  {isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOpen ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                </span>
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{statusText}</span>
              </div>
            </div>

            {/* Table Badge */}
            {hasTable && (
              <div className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-secondary border border-border">
                <MapPin className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Mesa {tableNumber?.toString().padStart(2, "0")}
                  </p>
                  {tableName && (
                    <p className="text-xs text-muted-foreground">{tableName}</p>
                  )}
                </div>
                <button
                  onClick={clearTable}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  title="Trocar mesa"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
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
            {tenant.phone && (
              <a href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`} className="flex flex-col items-center gap-1.5 group">
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
              to={buildRoute('/cardapio')}
              variant="hero"
              badge="DESTAQUE"
            />
          )}

          {/* Colored Module Cards */}
          {modules?.waiterCall && (
            <ActionCard
              icon={Bell}
              title="Pedir Atendimento"
              description={isOpen ? "Solicite atendimento na sua mesa" : "Disponível no horário de funcionamento"}
              to={buildRoute('/solicitar-atendimento')}
              variant="amber"
              disabled={!isOpen}
            />
          )}

          {modules?.reservations && (
            <ActionCard
              icon={CalendarCheck}
              title="Fazer Reserva"
              description="Reserve sua mesa com antecedência"
              to={buildRoute('/reservas')}
              variant="purple"
            />
          )}

          {modules?.queue && (
            <ActionCard
              icon={Users}
              title="Fila de Espera"
              description={isOpen ? "Entre na fila e acompanhe sua posição" : "Disponível no horário de funcionamento"}
              to={buildRoute('/fila')}
              variant="blue"
              disabled={!isOpen}
            />
          )}

          {modules?.kitchenOrder && (
            <ActionCard
              icon={ChefHat}
              title="Pedido Cozinha"
              description={isOpen ? "Monte seu prato personalizado" : "Disponível no horário de funcionamento"}
              to={buildRoute('/pedido-cozinha')}
              variant="rose"
              disabled={!isOpen}
            />
          )}

          {modules?.customerReview && (
            <ActionCard
              icon={Star}
              title="Avaliar Experiência"
              description="Compartilhe sua opinião sobre nosso serviço"
              to={buildRoute('/avaliacao')}
              variant="amber"
            />
          )}

          {modules?.preOrders && (
            <ActionCard
              icon={ShoppingBag}
              title="Fazer Encomenda"
              description="Peça com antecedência e retire no horário combinado"
              to={buildRoute('/encomendas')}
              variant="primary"
            />
          )}
        </div>

        {/* Map Card - Usa coordenadas se disponíveis, senão usa endereço */}
        {(locationCoordinates || tenant.address) && (
          <div className="mt-6">
            <a
              href={
                locationCoordinates 
                  ? generateGoogleMapsUrl(locationCoordinates)
                  : `https://maps.google.com/?q=${encodeURIComponent(tenant.address || '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-border group"
            >
              <div className="relative h-32 bg-secondary overflow-hidden">
                {locationCoordinates ? (
                  <iframe
                    src={`https://www.google.com/maps?q=${locationCoordinates.latitude},${locationCoordinates.longitude}&output=embed`}
                    width="100%"
                    height="128"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="pointer-events-none"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-medium">{tenant.address || 'Ver no mapa'}</p>
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
            Powered by <span className="text-primary font-medium">Chama Atende</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <a href="/termos" className="hover:text-primary transition-colors">TERMOS</a>
            <span>•</span>
            <a href="/privacidade" className="hover:text-primary transition-colors">PRIVACIDADE</a>
            <span>•</span>
            <Link to={`/admin/${slug}`} className="hover:text-primary transition-colors flex items-center gap-1">
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
