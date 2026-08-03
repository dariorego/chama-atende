import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWhatsappInstances, useWhatsappStats, useAiSettings } from "@/hooks/useWhatsappAi";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  Coins,
  MessageSquare,
  Smartphone,
  Timer,
  UserRound,
} from "lucide-react";
import { STATUS_LABEL, statusVariant } from "./status";

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function WhatsappDashboard() {
  const { data: instances, isLoading: loadingInstances } = useWhatsappInstances();
  const { data: stats, isLoading: loadingStats } = useWhatsappStats();
  const { data: settings } = useAiSettings();

  if (loadingInstances || loadingStats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const estimatedCost = ((stats?.tokens ?? 0) / 1_000_000) * 0.6;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conexões"
          value={instances?.length ?? 0}
          hint={`${instances?.filter((i) => i.status === "connected").length ?? 0} conectada(s)`}
          icon={Smartphone}
        />
        <StatCard title="Recebidas hoje" value={stats?.received ?? 0} icon={ArrowDownLeft} />
        <StatCard title="Enviadas hoje" value={stats?.sent ?? 0} icon={ArrowUpRight} />
        <StatCard
          title="Respondidas pela IA"
          value={stats?.aiAnswered ?? 0}
          hint={settings?.enabled ? "IA ativa" : "IA desligada"}
          icon={Bot}
        />
        <StatCard title="Conversas abertas" value={stats?.openConversations ?? 0} icon={MessageSquare} />
        <StatCard title="Em atendimento humano" value={stats?.humanConversations ?? 0} icon={UserRound} />
        <StatCard
          title="Tempo médio da IA"
          value={stats?.avgResponseMs ? `${(stats.avgResponseMs / 1000).toFixed(1)}s` : "—"}
          icon={Timer}
        />
        <StatCard
          title="Tokens hoje"
          value={(stats?.tokens ?? 0).toLocaleString("pt-BR")}
          hint={`Custo estimado ~US$ ${estimatedCost.toFixed(4)}`}
          icon={Coins}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Situação das conexões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!instances?.length && (
            <p className="text-sm text-muted-foreground">
              Nenhuma conexão cadastrada. Vá até a aba Conexões para conectar um número.
            </p>
          )}
          {instances?.map((instance) => (
            <div
              key={instance.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{instance.name}</p>
                <p className="text-xs text-muted-foreground">{instance.phone ?? "Número não vinculado"}</p>
              </div>
              <Badge variant={statusVariant(instance.status)}>{STATUS_LABEL[instance.status] ?? instance.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}