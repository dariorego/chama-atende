import { useState } from "react";
import { Loader2, ChefHat, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminOrders, useOrderStats, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { OrderCard } from "@/components/admin/OrderCard";

const STATUS_TABS = [
  { value: "all", label: "Todos", icon: null },
  { value: "pending", label: "Pendentes", icon: Clock },
  { value: "preparing", label: "Preparando", icon: ChefHat },
  { value: "ready", label: "Prontos", icon: CheckCircle },
  { value: "delivered", label: "Entregues", icon: Truck },
  { value: "cancelled", label: "Cancelados", icon: XCircle },
];

export default function AdminOrders() {
  const { restaurant: settings } = useAdminSettings();
  const restaurantId = settings?.id;

  const [activeTab, setActiveTab] = useState("all");
  
  const { data: orders, isLoading } = useAdminOrders(restaurantId, activeTab);
  const { data: stats } = useOrderStats(restaurantId);
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateStatus.mutate({ orderId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe e gerencie os pedidos em tempo real</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-400">Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-400">{stats?.pending || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-400">Preparando</CardDescription>
            <CardTitle className="text-3xl text-blue-400">{stats?.preparing || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-400">Prontos</CardDescription>
            <CardTitle className="text-3xl text-green-400">{stats?.ready || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-muted/50 border-border">
          <CardHeader className="pb-2">
            <CardDescription>Entregues</CardDescription>
            <CardTitle className="text-3xl">{stats?.delivered || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-muted/50 border-border">
          <CardHeader className="pb-2">
            <CardDescription>Total Hoje</CardDescription>
            <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="relative">
              {tab.icon && <tab.icon className="h-4 w-4 mr-1" />}
              {tab.label}
              {tab.value !== "all" && stats?.[tab.value as keyof typeof stats] > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1 text-xs"
                >
                  {stats[tab.value as keyof typeof stats]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {orders?.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto p-4 rounded-full bg-muted w-fit mb-2">
                    <ChefHat className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardTitle>Nenhum pedido</CardTitle>
                  <CardDescription>
                    {tab.value === "all"
                      ? "Ainda não há pedidos hoje"
                      : `Nenhum pedido ${tab.label.toLowerCase()}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={updateStatus.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
