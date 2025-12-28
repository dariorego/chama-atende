import { StatusBadge } from "@/components/ui/status-badge";
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
  Phone,
} from "lucide-react";

// Demo data - will be replaced with Supabase data
const establishment = {
  name: "Bistro Verde",
  slug: "bistro-verde",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&crop=center",
  status: "open" as const,
  hours: "11:00 - 23:00",
  address: "Rua das Flores, 123 - Centro",
  phone: "(11) 99999-9999",
  modules: {
    menu: true,
    waiterCall: true,
    reservations: true,
    queue: true,
  },
  social: {
    instagram: "https://instagram.com/bistroverde",
    facebook: "https://facebook.com/bistroverde",
  },
};

const HubPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent h-64" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 pt-8 pb-6 max-w-lg">
          {/* Logo and Status */}
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="relative">
              <img
                src={establishment.logo}
                alt={establishment.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-primary/30 shadow-glow"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <StatusBadge status={establishment.status} />
              </div>
            </div>

            <h1 className="mt-6 text-2xl font-bold text-foreground">
              {establishment.name}
            </h1>

            {/* Info Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
                <Clock className="h-4 w-4" />
                {establishment.hours}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
                <MapPin className="h-4 w-4" />
                Centro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 pb-8 max-w-lg">
        <div className="space-y-3">
          {establishment.modules.menu && (
            <ActionCard
              icon={UtensilsCrossed}
              title="Cardápio Digital"
              description="Explore nosso menu completo com fotos e descrições"
              to="/cardapio"
              variant="primary"
            />
          )}

          {establishment.modules.waiterCall && (
            <ActionCard
              icon={Bell}
              title="Solicitar Atendimento"
              description="Solicite atendimento na sua mesa"
              to="/solicitar-atendimento"
            />
          )}

          {establishment.modules.reservations && (
            <ActionCard
              icon={CalendarCheck}
              title="Fazer Reserva"
              description="Reserve sua mesa com antecedência"
              to="/reservas"
            />
          )}

          {establishment.modules.queue && (
            <ActionCard
              icon={Users}
              title="Fila de Espera"
              description="Entre na fila e acompanhe sua posição"
              to="/fila"
            />
          )}
        </div>

        {/* Contact & Social */}
        <div className="mt-8 pt-6 border-t border-border">
          {/* Address */}
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{establishment.address}</p>
          </div>

          {/* Phone */}
          <a
            href={`tel:${establishment.phone}`}
            className="flex items-center gap-3 mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            {establishment.phone}
          </a>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-6">
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
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by <span className="text-primary font-medium">RestoPlatform</span>
        </p>
      </div>
    </div>
  );
};

export default HubPage;
