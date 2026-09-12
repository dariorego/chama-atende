import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CalendarClock, CheckCircle2, Loader2, Search, ShieldBan, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MODULE_INFO } from '@/hooks/useAdminModules';
import { getLicenseState, LicenseState } from '@/hooks/useTenantLicense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type PlanId = 'starter' | 'professional' | 'enterprise';
type LicenseStatus = 'active' | 'suspended';
type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  is_active: boolean;
  restaurant_licenses: Array<{ id: string; plan: string; status: LicenseStatus; starts_at: string; expires_at: string | null }>;
  restaurant_modules: Array<{ module_name: string; is_active: boolean | null }>;
};

const ALL_MODULES = Object.keys(MODULE_INFO);
const PLAN_MODULES: Record<PlanId, string[]> = {
  starter: ['menu'],
  professional: ALL_MODULES,
  enterprise: ALL_MODULES,
};
const PLAN_LABELS: Record<PlanId, string> = { starter: 'Starter', professional: 'Profissional', enterprise: 'Enterprise' };
const STATE_LABELS: Record<LicenseState, string> = {
  active: 'Ativa', expiring: 'Vence em breve', expired: 'Vencida', suspended: 'Suspensa', unconfigured: 'Sem licença',
};

function todayIso() { return new Date().toISOString().slice(0, 10); }
function plusDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export default function PlatformDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [editing, setEditing] = useState<RestaurantRow | null>(null);
  const [plan, setPlan] = useState<PlanId>('starter');
  const [status, setStatus] = useState<LicenseStatus>('active');
  const [startsAt, setStartsAt] = useState(todayIso());
  const [expiresAt, setExpiresAt] = useState('');
  const [modules, setModules] = useState<string[]>([]);

  const restaurantsQuery = useQuery({
    queryKey: ['platform-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, slug, plan, is_active, restaurant_licenses(id, plan, status, starts_at, expires_at), restaurant_modules(module_name, is_active)')
        .order('name');
      if (error) throw error;
      return (data ?? []) as RestaurantRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error('Estabelecimento não selecionado');
      const { error } = await supabase.rpc('save_platform_license', {
        _restaurant_id: editing.id,
        _plan: plan,
        _status: status,
        _starts_at: startsAt,
        _expires_at: expiresAt || null,
        _module_names: modules,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform-restaurants'] });
      setEditing(null);
      toast.success('Licença atualizada com sucesso');
    },
    onError: (error: Error) => toast.error(error.message || 'Não foi possível atualizar a licença'),
  });

  const rows = restaurantsQuery.data ?? [];
  const computed = rows.map((restaurant) => {
    const license = restaurant.restaurant_licenses[0] ?? null;
    return { restaurant, license, state: getLicenseState(license) };
  });
  const filtered = computed.filter(({ restaurant, state }) => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !term || restaurant.name.toLocaleLowerCase('pt-BR').includes(term) || restaurant.slug.toLocaleLowerCase('pt-BR').includes(term);
    return matchesSearch && (stateFilter === 'all' || state === stateFilter);
  });
  const counts = useMemo(() => ({
    total: computed.length,
    active: computed.filter((item) => item.state === 'active').length,
    expiring: computed.filter((item) => item.state === 'expiring').length,
    blocked: computed.filter((item) => item.state === 'expired' || item.state === 'suspended').length,
  }), [computed]);

  const openEditor = (restaurant: RestaurantRow) => {
    const license = restaurant.restaurant_licenses[0];
    const nextPlan = (license?.plan || restaurant.plan || 'starter') as PlanId;
    setEditing(restaurant);
    setPlan(nextPlan);
    setStatus(license?.status || 'active');
    setStartsAt(license?.starts_at || todayIso());
    setExpiresAt(license?.expires_at || '');
    const active = restaurant.restaurant_modules.filter((item) => item.is_active).map((item) => item.module_name);
    setModules(active.length ? active : PLAN_MODULES[nextPlan]);
  };

  const selectPlan = (nextPlan: PlanId) => {
    setPlan(nextPlan);
    setModules([...PLAN_MODULES[nextPlan]]);
  };
  const toggleModule = (name: string, enabled: boolean) => {
    setModules((current) => enabled ? [...new Set([...current, name])] : current.filter((item) => item !== name));
  };

  if (restaurantsQuery.isLoading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Controle central</p>
        <h1 className="text-3xl font-bold">Licenças e estabelecimentos</h1>
        <p className="mt-1 text-muted-foreground">Gerencie planos, vencimentos e os módulos disponíveis em cada operação.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo de licenças">
        {[
          { label: 'Estabelecimentos', value: counts.total, icon: Building2 },
          { label: 'Licenças ativas', value: counts.active, icon: CheckCircle2 },
          { label: 'Vencem em 7 dias', value: counts.expiring, icon: CalendarClock },
          { label: 'Bloqueadas', value: counts.blocked, icon: ShieldBan },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div><div className="rounded-lg bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div></CardContent></Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="bg-surface pl-9 placeholder:text-surface-foreground" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou slug" /></div>
          <Select value={stateFilter} onValueChange={setStateFilter}><SelectTrigger className="w-full bg-surface sm:w-56"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem><SelectItem value="active">Ativas</SelectItem><SelectItem value="expiring">Vencem em breve</SelectItem><SelectItem value="expired">Vencidas</SelectItem><SelectItem value="suspended">Suspensas</SelectItem></SelectContent></Select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="hidden grid-cols-[minmax(220px,1.5fr)_140px_150px_160px_120px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase text-muted-foreground md:grid"><span>Estabelecimento</span><span>Plano</span><span>Situação</span><span>Vencimento</span><span className="text-right">Ação</span></div>
          {filtered.map(({ restaurant, license, state }) => (
            <article key={restaurant.id} className="grid gap-4 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[minmax(220px,1.5fr)_140px_150px_160px_120px] md:items-center">
              <div><p className="font-semibold">{restaurant.name}</p><p className="text-sm text-muted-foreground">/{restaurant.slug} · {restaurant.restaurant_modules.filter((item) => item.is_active).length} módulos</p></div>
              <span>{PLAN_LABELS[(license?.plan || restaurant.plan || 'starter') as PlanId] || license?.plan || restaurant.plan}</span>
              <div><Badge variant={state === 'expired' || state === 'suspended' ? 'destructive' : state === 'expiring' ? 'secondary' : 'outline'}>{STATE_LABELS[state]}</Badge></div>
              <span className="text-sm">{license?.expires_at ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${license.expires_at}T12:00:00`)) : 'Sem vencimento'}</span>
              <Button variant="outline" size="sm" className="justify-self-start md:justify-self-end" onClick={() => openEditor(restaurant)}>Gerenciar</Button>
            </article>
          ))}
          {!filtered.length && <p className="p-8 text-center text-muted-foreground">Nenhum estabelecimento encontrado.</p>}
        </div>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-background">
          <DialogHeader><DialogTitle>Gerenciar {editing?.name}</DialogTitle><DialogDescription>O plano sugere os módulos; você pode personalizar a seleção antes de salvar.</DialogDescription></DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Plano</Label><Select value={plan} onValueChange={(value) => selectPlan(value as PlanId)}><SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="starter">Starter</SelectItem><SelectItem value="professional">Profissional</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Situação</Label><Select value={status} onValueChange={(value) => setStatus(value as LicenseStatus)}><SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Ativa</SelectItem><SelectItem value="suspended">Suspensa</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Início</Label><Input type="date" className="bg-surface" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div>
              <div className="space-y-2"><Label>Vencimento</Label><Input type="date" className="bg-surface" value={expiresAt} min={startsAt} onChange={(event) => setExpiresAt(event.target.value)} /></div>
              <div className="flex items-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setExpiresAt(plusDays(expiresAt || todayIso(), 30))}>Renovar +30 dias</Button><Button type="button" variant="outline" onClick={() => setExpiresAt('')}>Sem vencimento</Button></div>
            </div>
            <div className="space-y-3"><div><Label>Módulos liberados</Label><p className="text-xs text-muted-foreground">Alterações nesta lista são exceções ao modelo do plano.</p></div><div className="grid gap-2 sm:grid-cols-2">{ALL_MODULES.map((name) => <div key={name} className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2"><div><p className="text-sm font-medium">{MODULE_INFO[name].label}</p><p className="text-xs text-surface-foreground">{PLAN_MODULES[plan].includes(name) ? 'Incluído no plano' : 'Exceção opcional'}</p></div><Switch checked={modules.includes(name)} onCheckedChange={(checked) => toggleModule(name, checked)} /></div>)}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button disabled={saveMutation.isPending || !startsAt} onClick={() => saveMutation.mutate()}>{saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar licença</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
