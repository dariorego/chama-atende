import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Puzzle, Loader2, UtensilsCrossed, Bell, CalendarDays, Users, ChefHat, Star, ShoppingBag } from 'lucide-react';
import { useAdminModules, MODULE_INFO } from '@/hooks/useAdminModules';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Bell,
  CalendarDays,
  Users,
  ChefHat,
  Star,
  ShoppingBag,
};

export default function AdminModules() {
  const { modules, isLoading, toggleModule, isToggling } = useAdminModules();

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
        <h2 className="text-2xl font-bold tracking-tight">Módulos</h2>
        <p className="text-muted-foreground">
          Ative ou desative funcionalidades do seu restaurante
        </p>
      </div>

      <div className="grid gap-4">
        {modules?.map((module) => {
          const info = MODULE_INFO[module.module_name];
          const IconComponent = info ? ICON_MAP[info.icon] : Puzzle;

          return (
            <Card key={module.id} className={!module.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                    <div>
                      <CardTitle className="text-base">
                        {info?.label || module.module_name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {info?.description || 'Módulo do sistema'}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={(checked) =>
                      toggleModule({ moduleId: module.id, isActive: checked })
                    }
                    disabled={isToggling}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {(!modules || modules.length === 0) && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Nenhum módulo configurado para este restaurante.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
