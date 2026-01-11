import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Settings } from 'lucide-react';
import { usePreOrders } from '@/hooks/usePreOrders';
import { usePreOrderModuleSettings } from '@/hooks/usePreOrderModuleSettings';
import { PreOrderCard } from '@/components/admin/PreOrderCard';

const ADVANCE_HOUR_OPTIONS = [
  { value: 12, label: '12 horas' },
  { value: 24, label: '24 horas' },
  { value: 48, label: '48 horas' },
  { value: 72, label: '72 horas' },
];

export default function AdminPreOrders() {
  const [activeTab, setActiveTab] = useState('pending');
  const { preOrders, isLoading, updateStatus, isUpdating, saveResponse, isSavingResponse } = usePreOrders();
  const { settings, updateSettings, isUpdating: isUpdatingSettings } = usePreOrderModuleSettings();

  const filterByStatus = (status: string | string[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return preOrders?.filter((order) => statuses.includes(order.status)) ?? [];
  };

  const pendingOrders = filterByStatus('pending');
  const confirmedOrders = filterByStatus(['confirmed', 'preparing']);
  const readyOrders = filterByStatus('ready');
  const historyOrders = filterByStatus(['delivered', 'cancelled']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Encomendas</h2>
        <p className="text-muted-foreground">
          Gerencie as encomendas antecipadas do seu estabelecimento
        </p>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </CardTitle>
          <CardDescription>
            Configure o prazo mínimo de antecedência para encomendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="advance-hours" className="shrink-0">
              Antecedência mínima:
            </Label>
            <Select
              value={settings?.min_advance_hours?.toString()}
              onValueChange={(value) => updateSettings({ min_advance_hours: Number(value) })}
              disabled={isUpdatingSettings}
            >
              <SelectTrigger id="advance-hours" className="w-40">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ADVANCE_HOUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Em Produção
            {confirmedOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {confirmedOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready">
            Prontas
            {readyOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-green-500 text-white rounded-full">
                {readyOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingOrders.length === 0 ? (
            <EmptyState message="Nenhuma encomenda pendente" />
          ) : (
            pendingOrders.map((order) => (
              <PreOrderCard
                key={order.id}
                preOrder={order}
                onUpdateStatus={updateStatus}
                onSaveResponse={saveResponse}
                isUpdating={isUpdating}
                isSavingResponse={isSavingResponse}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4 mt-4">
          {confirmedOrders.length === 0 ? (
            <EmptyState message="Nenhuma encomenda em produção" />
          ) : (
            confirmedOrders.map((order) => (
              <PreOrderCard
                key={order.id}
                preOrder={order}
                onUpdateStatus={updateStatus}
                onSaveResponse={saveResponse}
                isUpdating={isUpdating}
                isSavingResponse={isSavingResponse}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4 mt-4">
          {readyOrders.length === 0 ? (
            <EmptyState message="Nenhuma encomenda pronta" />
          ) : (
            readyOrders.map((order) => (
              <PreOrderCard
                key={order.id}
                preOrder={order}
                onUpdateStatus={updateStatus}
                onSaveResponse={saveResponse}
                isUpdating={isUpdating}
                isSavingResponse={isSavingResponse}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {historyOrders.length === 0 ? (
            <EmptyState message="Nenhuma encomenda no histórico" />
          ) : (
            historyOrders.map((order) => (
              <PreOrderCard
                key={order.id}
                preOrder={order}
                onUpdateStatus={updateStatus}
                onSaveResponse={saveResponse}
                isUpdating={isUpdating}
                isSavingResponse={isSavingResponse}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
