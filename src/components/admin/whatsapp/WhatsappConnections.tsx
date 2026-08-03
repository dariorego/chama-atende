import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, QrCode, RefreshCw, RotateCcw, Trash2, Unplug } from "lucide-react";
import { useWhatsappInstances, useWhatsappManage, type WhatsappInstance } from "@/hooks/useWhatsappAi";
import { STATUS_LABEL, statusVariant } from "./status";

const nameSchema = z.string().trim().min(2, "Informe ao menos 2 caracteres").max(60, "Máximo de 60 caracteres");

export function WhatsappConnections() {
  const { data: instances, isLoading, refetch } = useWhatsappInstances();
  const manage = useWhatsappManage();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<WhatsappInstance | null>(null);

  const run = async (instance: WhatsappInstance, action: "qrcode" | "status" | "restart" | "disconnect") => {
    setBusyId(instance.id);
    try {
      await manage.mutateAsync({ action, instanceId: instance.id });
      await refetch();
      const labels: Record<string, string> = {
        qrcode: "QR Code atualizado",
        status: "Status atualizado",
        restart: "Instância reiniciada",
        disconnect: "Número desconectado",
      };
      toast.success(labels[action]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na operação");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0].message);
      return;
    }
    setNameError(null);
    try {
      await manage.mutateAsync({ action: "create_instance", name: parsed.data });
      setName("");
      await refetch();
      toast.success("Conexão criada — escaneie o QR Code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar conexão");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await manage.mutateAsync({ action: "delete_instance", instanceId: toDelete.id });
      await refetch();
      toast.success("Conexão removida");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover conexão");
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Nova conexão</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="wa-name">Nome da conexão</Label>
            <Input
              id="wa-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Atendimento principal"
              maxLength={60}
              className="bg-surface placeholder:text-surface-foreground border-border focus:border-primary"
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>
          <Button onClick={handleCreate} disabled={manage.isPending}>
            {manage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2">Criar e gerar QR</span>
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : !instances?.length ? (
        <p className="text-sm text-muted-foreground">Nenhuma conexão cadastrada ainda.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {instances.map((instance) => {
            const busy = busyId === instance.id;
            return (
              <Card key={instance.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{instance.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {instance.phone ? `+${instance.phone}` : "Número não vinculado"}
                    </p>
                    <p className="text-xs text-muted-foreground">Instância: {instance.instance_name}</p>
                  </div>
                  <Badge variant={statusVariant(instance.status)}>
                    {STATUS_LABEL[instance.status] ?? instance.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instance.status === "qr" && instance.qr_code && (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4">
                      <img
                        src={
                          instance.qr_code.startsWith("data:")
                            ? instance.qr_code
                            : `data:image/png;base64,${instance.qr_code}`
                        }
                        alt={`QR Code da conexão ${instance.name}`}
                        className="h-48 w-48 object-contain"
                      />
                      <p className="text-center text-xs text-muted-foreground">
                        Abra o WhatsApp &gt; Aparelhos conectados &gt; Conectar aparelho
                      </p>
                    </div>
                  )}

                  {instance.last_error && (
                    <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{instance.last_error}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(instance, "qrcode")}>
                      <QrCode className="mr-1 h-3.5 w-3.5" /> Gerar/Atualizar QR
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(instance, "status")}>
                      <RefreshCw className="mr-1 h-3.5 w-3.5" /> Verificar status
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(instance, "restart")}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reiniciar
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(instance, "disconnect")}>
                      <Unplug className="mr-1 h-3.5 w-3.5" /> Desconectar
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busy} onClick={() => setToDelete(instance)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conexão</AlertDialogTitle>
            <AlertDialogDescription>
              A instância será removida da Evolution API e todo o histórico de conversas desta conexão será apagado.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}