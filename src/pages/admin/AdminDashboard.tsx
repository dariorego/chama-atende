import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { useMenuProducts } from '@/hooks/useMenuProducts';
import { useRestaurantModules } from '@/hooks/useRestaurantModules';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { 
  UtensilsCrossed, 
  FolderTree, 
  Puzzle, 
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Eye,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, isLoading: isLoadingAccess } = useAdminAccess(slug ?? '');
  const { data: categories, isLoading: isLoadingCategories } = useMenuCategories(restaurant?.id);
  const { data: products, isLoading: isLoadingProducts } = useMenuProducts(restaurant?.id);
  const { data: modules, isLoading: isLoadingModules } = useRestaurantModules(restaurant?.id);
  const { users, isLoading: isLoadingUsers } = useAdminUsers();

  const isLoading = isLoadingAccess || isLoadingCategories || isLoadingProducts || isLoadingModules || isLoadingUsers;

  // Count active modules
  const activeModules = modules ? Object.entries(modules).filter(([_, active]) => active) : [];
  const activeModuleNames = activeModules.map(([name]) => name);

  // Calculate stats
  const highlightProducts = products?.filter(p => p.is_highlight).length ?? 0;
  const avgPrice = products && products.length > 0 
    ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(2)
    : '0.00';
  const promotionalProducts = products?.filter(p => p.promotional_price).length ?? 0;

  // Products by category for chart
  const productsByCategory = categories?.map(cat => ({
    name: cat.name.length > 12 ? cat.name.slice(0, 12) + '...' : cat.name,
    produtos: products?.filter(p => p.category_id === cat.id).length ?? 0,
  })) ?? [];

  // Pie chart data for product status
  const productStatusData = [
    { name: 'Ativos', value: products?.filter(p => p.is_active).length ?? 0, fill: 'hsl(var(--chart-1))' },
    { name: 'Inativos', value: products?.filter(p => !p.is_active).length ?? 0, fill: 'hsl(var(--chart-2))' },
  ];

  // Simulated weekly views (in real app, would come from analytics)
  const weeklyData = [
    { day: 'Seg', visitas: 45 },
    { day: 'Ter', visitas: 52 },
    { day: 'Qua', visitas: 49 },
    { day: 'Qui', visitas: 63 },
    { day: 'Sex', visitas: 89 },
    { day: 'Sáb', visitas: 132 },
    { day: 'Dom', visitas: 98 },
  ];

  const chartConfig: ChartConfig = {
    produtos: {
      label: "Produtos",
      color: "hsl(var(--chart-1))",
    },
    visitas: {
      label: "Visitas",
      color: "hsl(var(--chart-2))",
    },
  };

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
      value: users?.length ?? 0,
      description: 'Usuários cadastrados',
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const highlights = [
    {
      title: 'Preço Médio',
      value: `R$ ${avgPrice}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Em Destaque',
      value: highlightProducts,
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      title: 'Em Promoção',
      value: promotionalProducts,
      icon: TrendingUp,
      color: 'text-rose-500',
    },
    {
      title: 'Visitas (semana)',
      value: '528',
      icon: Eye,
      color: 'text-cyan-500',
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

      {/* Main Stats */}
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

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.title} className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Products by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos por Categoria</CardTitle>
            <CardDescription>Distribuição de itens no cardápio</CardDescription>
          </CardHeader>
          <CardContent>
            {productsByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={productsByCategory} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="produtos" 
                    fill="hsl(var(--chart-1))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">
                Nenhuma categoria cadastrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visitas da Semana</CardTitle>
            <CardDescription>Acessos ao cardápio digital</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={weeklyData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="visitas" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Restaurant Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Status do Restaurante
            </CardTitle>
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

        {/* Product Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {productStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                <span>Ativos ({productStatusData[0].value})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                <span>Inativos ({productStatusData[1].value})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              Módulos Ativos
            </CardTitle>
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
                Nenhum módulo ativo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
