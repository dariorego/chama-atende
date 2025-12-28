import { useState, useEffect } from "react";
import { ActionCard } from "@/components/ui/action-card";
import {
  UtensilsCrossed,
  Bell,
  CalendarCheck,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Demo data - will be replaced with Supabase data
const establishment = {
  name: "Bistro Verde",
  subtitle: "Cozinha Natural & Bar",
  slug: "bistro-verde",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&crop=center",
  status: "open" as const,
  closingTime: "23:00",
  address: "Rua Augusta, 1500 - São Paulo - SP",
  phone: "(11) 99999-9999",
  menuImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop&crop=center",
  mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=300&fit=crop&crop=center",
  estimatedWaitTime: "~15 min",
  modules: {
    menu: true,
    waiterCall: true,
    reservations: true,
    queue: true,
  },
  social: {
    instagram: "https://instagram.com/bistroverde",
    facebook: "https://facebook.com/bistroverde",
    website: "https://bistroverde.com",
  },
  wifi: {
    network: "Bistro Verde Guest",
    password: "bemvindo2024",
  },
};

const HubPage = () => {
  const [scrolled, setScrolled] = useState(false);

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
        title: establishment.name,
        url: window.location.href,
      });
    }
  };

  const copyWifiPassword = () => {
    navigator.clipboard.writeText(establishment.wifi.password);
  };

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
              {establishment.name}
            </span>
            <Button variant="ghost" size="icon" className="text-foreground" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
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
                <img
                  src={establishment.logo}
                  alt={establishment.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Status badge inside */}
                <div className="absolute bottom-1 right-1 flex items-center gap-1 px-2 py-0.5 bg-primary rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
                  </span>
                  <span className="text-xs font-semibold text-primary-foreground">Aberto</span>
                </div>
              </div>
            </div>

            {/* Name and subtitle */}
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {establishment.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {establishment.subtitle}
            </p>

            {/* Opening hours */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Fecha às <span className="text-foreground font-medium">{establishment.closingTime}</span></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">Fotos</span>
            </button>
            <a href={`https://wa.me/${establishment.phone.replace(/\D/g, "")}`} className="flex flex-col items-center gap-1.5 group">
              <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">Chat</span>
            </a>
            {establishment.social.website && (
              <a href={establishment.social.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground">Site</span>
              </a>
            )}
            <button onClick={copyWifiPassword} className="flex flex-col items-center gap-1.5 group">
              <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                <Wifi className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">WiFi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 pb-8 max-w-lg">
        <div className="space-y-3">
          {/* Hero Menu Card */}
          {establishment.modules.menu && (
            <ActionCard
              icon={UtensilsCrossed}
              title="Cardápio Digital"
              description="Explore nosso menu completo com fotos e descrições detalhadas"
              to="/cardapio"
              variant="hero"
              badge="DESTAQUE"
              image={establishment.menuImage}
            />
          )}

          {/* Colored Module Cards */}
          {establishment.modules.waiterCall && (
            <ActionCard
              icon={Bell}
              title="Chamar Garçom"
              description="Solicite atendimento na sua mesa"
              to="/solicitar-atendimento"
              variant="amber"
            />
          )}

          {establishment.modules.reservations && (
            <ActionCard
              icon={CalendarCheck}
              title="Fazer Reserva"
              description="Reserve sua mesa com antecedência"
              to="/reservas"
              variant="purple"
            />
          )}

          {establishment.modules.queue && (
            <ActionCard
              icon={Users}
              title="Fila de Espera"
              description="Entre na fila e acompanhe sua posição"
              to="/fila"
              variant="blue"
              badge={establishment.estimatedWaitTime}
            />
          )}
        </div>

        {/* Map Card */}
        <div className="mt-6">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-border group"
          >
            <div className="relative h-32">
              <img
                src={establishment.mapImage}
                alt="Localização"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground font-medium">{establishment.address}</p>
                </div>
                <Button size="icon" variant="secondary" className="shrink-0">
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {establishment.social.instagram && (
            <a
              href={establishment.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {establishment.social.facebook && (
            <a
              href={establishment.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary font-medium">RestoPlatform</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <a href="/termos" className="hover:text-primary transition-colors">TERMOS</a>
            <span>•</span>
            <a href="/privacidade" className="hover:text-primary transition-colors">PRIVACIDADE</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubPage;
