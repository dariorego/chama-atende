import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Puzzle, Loader2, UtensilsCrossed, Bell, CalendarDays, Users, ChefHat, Star, ShoppingBag,
  Tv, Receipt, PartyPopper, CalendarClock, MessageCircle, Gift, Tag, UserPlus, ClipboardList, ShieldCheck,
  List, LayoutGrid,
} from 'lucide-react';
import { useAdminModules, MODULE_INFO } from '@/hooks/useAdminModules';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Bell,
  CalendarDays,
  Users,
  ChefHat,
  Star,
  ShoppingBag,
  Tv,
  Receipt,
  PartyPopper,
  CalendarClock,
  MessageCircle,
  Gift,
  Tag,
  UserPlus,
  ClipboardList,
  ShieldCheck,
};

export default function AdminModules() {
  const { modules, isLoading, toggleModule, isToggling } = useAdminModules();
  const [view, setView] = useState<'list' | 'grid'>('list');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Módulos</h2>
          <p className="text-muted-foreground">
            Ative ou desative funcionalidades do seu estabelecimento
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-1" /> Lista
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" /> Card
          </Button>
        </div>
      </div>

      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
        {[...(modules || [])]
          .sort((a, b) => {
            if (a.is_active === b.is_active) {
              return (MODULE_INFO[a.module_name]?.label || a.module_name).localeCompare(
                MODULE_INFO[b.module_name]?.label || b.module_name,
                'pt-BR'
              );
            }
            return a.is_active ? -1 : 1;
          })
          .map((module) => {
          const info = MODULE_INFO[module.module_name];
          const IconComponent = info ? ICON_MAP[info.icon] : Puzzle;

          return (
            <Card key={module.module_name} className={!module.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                {view === 'grid' ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {IconComponent ? (
                          <IconComponent className="h-5 w-5 text-primary" />
                        ) : (
                          <Puzzle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <Switch
                        checked={module.is_active}
                        onCheckedChange={(checked) =>
                          toggleModule({ moduleId: module.id, moduleName: module.module_name, isActive: checked })
                        }
                        disabled={isToggling}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{info?.label || module.module_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {info?.description || 'Módulo do sistema'}
                      </CardDescription>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {IconComponent ? (
                        <IconComponent className="h-5 w-5 text-primary" />
                      ) : (
                        <Puzzle className="h-5 w-5 text-primary" />
                      )}
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
                        toggleModule({ moduleId: module.id, moduleName: module.module_name, isActive: checked })
                      }
                      disabled={isToggling}
                    />
                  </div>
                )}
              </CardHeader>
            </Card>
          );
        })}

        {(!modules || modules.length === 0) && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Nenhum módulo configurado para este estabelecimento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
