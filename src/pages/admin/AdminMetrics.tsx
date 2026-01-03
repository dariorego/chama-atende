import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useAdminModules } from "@/hooks/useAdminModules";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  UtensilsCrossed, 
  Tag, 
  Users,
  TrendingUp,
  Percent,
  Package
} from "lucide-react";

const AdminMetrics = () => {
  const { restaurant, isLoading: restaurantLoading } = useAdminSettings();
  const { profile, isLoading: profileLoading } = useCurrentUser();
  
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: products, isLoading: productsLoading } = useAdminProducts({});
  const { modules, isLoading: modulesLoading } = useAdminModules();
  const { users, isLoading: usersLoading } = useAdminUsers();

  const isLoading = restaurantLoading || profileLoading || categoriesLoading || productsLoading || modulesLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const inactiveProducts = totalProducts - activeProducts;
  const promoProducts = products?.filter(p => p.promotional_price).length || 0;
  const avgPrice = products?.length 
    ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(2) 
    : "0.00";
  const activeModules = modules?.filter(m => m.is_active).length || 0;
  const totalModules = modules?.length || 0;
  const totalUsers = users?.length || 0;

  // Chart data
  const productsByCategory = categories?.map(cat => ({
    name: cat.name.length > 10 ? cat.name.substring(0, 10) + "..." : cat.name,
    quantidade: products?.filter(p => p.category_id === cat.id).length || 0,
  })) || [];

  const productStatusData = [
    { name: "Ativos", value: activeProducts, color: "hsl(var(--chart-1))" },
    { name: "Inativos", value: inactiveProducts, color: "hsl(var(--chart-2))" },
  ];

  const weeklyVisits = [
    { day: "Seg", visitas: 45 },
    { day: "Ter", visitas: 52 },
    { day: "Qua", visitas: 48 },
    { day: "Qui", visitas: 61 },
    { day: "Sex", visitas: 85 },
    { day: "Sáb", visitas: 120 },
    { day: "Dom", visitas: 95 },
  ];

  const stats = [
    { label: "Total de Produtos", value: totalProducts, icon: Package, color: "text-blue-500" },
    { label: "Categorias", value: categories?.length || 0, icon: Tag, color: "text-green-500" },
    { label: "Preço Médio", value: `R$ ${avgPrice}`, icon: TrendingUp, color: "text-orange-500" },
    { label: "Em Promoção", value: promoProducts, icon: Percent, color: "text-red-500" },
    { label: "Módulos Ativos", value: activeModules, icon: UtensilsCrossed, color: "text-purple-500" },
    { label: "Usuários", value: totalUsers, icon: Users, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
        <p className="text-muted-foreground">Estatísticas e desempenho do {restaurant?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos por Categoria</CardTitle>
            <CardDescription>Distribuição de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productsByCategory}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Visitas Semanais</CardTitle>
            <CardDescription>Acessos ao cardápio (simulado)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyVisits}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="visitas" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Product Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Produtos</CardTitle>
            <CardDescription>Ativos vs Inativos</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {productStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Restaurant Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Restaurante</CardTitle>
            <CardDescription>Informações gerais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-500">Ativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-medium">
                {restaurant?.opening_time && restaurant?.closing_time 
                  ? `${restaurant.opening_time} - ${restaurant.closing_time}` 
                  : "Não definido"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Produtos Ativos</span>
              <span className="font-medium">{activeProducts} de {totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Módulos Ativos</span>
              <span className="font-medium">{activeModules} de {totalModules}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMetrics;
