import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { useMenuProducts } from '@/hooks/useMenuProducts';
import { useRestaurantModules } from '@/hooks/useRestaurantModules';
import { 
  UtensilsCrossed, 
  FolderTree, 
  Puzzle, 
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, isLoading: isLoadingAccess } = useAdminAccess(slug ?? '');
  const { data: categories, isLoading: isLoadingCategories } = useMenuCategories(restaurant?.id);
  const { data: products, isLoading: isLoadingProducts } = useMenuProducts(restaurant?.id);
  const { data: modules, isLoading: isLoadingModules } = useRestaurantModules(restaurant?.id);

  const isLoading = isLoadingAccess || isLoadingCategories || isLoadingProducts || isLoadingModules;

  // Count active modules
  const activeModules = modules ? Object.entries(modules).filter(([_, active]) => active) : [];
  const activeModuleNames = activeModules.map(([name]) => name);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Produtos',
      value: products?.length ?? 0,
      description: 'Itens no cardápio',
      icon: UtensilsCrossed,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Categorias',
      value: categories?.length ?? 0,
      description: 'Grupos de produtos',
      icon: FolderTree,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Módulos Ativos',
      value: activeModules.length,
      description: 'Funcionalidades habilitadas',
      icon: Puzzle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Equipe',
      value: '-',
      description: 'Usuários cadastrados',
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Olá, bem-vindo ao {restaurant?.name}!
        </h2>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu restaurante
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Status do Restaurante
            </CardTitle>
            <CardDescription>
              Informações sobre o funcionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                restaurant?.status === 'open' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {restaurant?.status === 'open' ? 'Aberto' : 'Fechado'}
              </span>
            </div>
            {restaurant?.opening_time && restaurant?.closing_time && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Horário</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              Módulos Ativos
            </CardTitle>
            <CardDescription>
              Funcionalidades habilitadas para o cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeModuleNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeModuleNames.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum módulo ativo no momento
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}