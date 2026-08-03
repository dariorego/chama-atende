import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useWhatsappLogs } from "@/hooks/useWhatsappAi";

const KINDS = [
  { value: "all", label: "Todos" },
  { value: "evolution", label: "Evolution API" },
  { value: "openrouter", label: "OpenRouter (IA)" },
  { value: "webhook", label: "Webhook" },
];

export function WhatsappLogs() {
  const [kind, setKind] = useState("all");
  const { data: logs, isLoading } = useWhatsappLogs({ kind });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Últimos 200 registros</CardTitle>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-48 bg-surface border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : !logs?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum log registrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const ok = !log.error && (log.status_code ?? 200) < 400;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs">{log.kind}</TableCell>
                    <TableCell className="text-xs">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={ok ? "default" : "destructive"} className="text-[10px]">
                        {log.status_code ?? (ok ? "OK" : "erro")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{log.duration_ms ? `${log.duration_ms}ms` : "—"}</TableCell>
                    <TableCell>
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary">
                          Ver <ChevronDown className="h-3 w-3" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {log.error && <p className="mt-2 text-xs text-destructive">{log.error}</p>}
                          <pre className="mt-2 max-h-48 max-w-md overflow-auto rounded-md bg-surface p-2 text-[10px]">
                            {JSON.stringify({ request: log.request, response: log.response }, null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}