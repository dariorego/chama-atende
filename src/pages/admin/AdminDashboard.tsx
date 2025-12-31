import { useParams, Link } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAdminModules } from "@/hooks/useAdminModules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Bell, Calendar, Users, Star, ChefHat, Settings, UserCog, LayoutDashboard, ArrowRight } from "lucide-react";

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

export default function AdminDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(slug || "");
  const { profile, isLoading: profileLoading } = useCurrentUser();
  const { modules, isLoading: modulesLoading } = useAdminModules();

  if (restaurantLoading || profileLoading || modulesLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const activeModules = modules?.filter((m) => m.is_active) || [];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Olá, {profile?.full_name || "Administrador"}! 👋</h1>
        <p className="text-muted-foreground text-lg">{restaurant?.name}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Módulos do Restaurante</h2>
        {activeModules.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum módulo ativo. <Link to={`/${slug}/admin/modulos`} className="text-primary underline">Ativar módulos</Link></CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeModules.map((module) => {
              const config = MODULE_CONFIG[module.module_name];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <Link key={module.id} to={`/${slug}/admin/${config.href}`}>
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
            return <Link key={item.href} to={`/${slug}/admin/${item.href}`}><Button variant="outline" className="gap-2"><Icon className="h-4 w-4" />{item.label}</Button></Link>;
          })}
        </div>
      </div>
    </div>
  );
}
