import { useState } from "react";
import { Gift, Plus, Pencil, Trash2, Users, Link2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  useAdminReferralPrograms,
  useCreateReferralProgram,
  useUpdateReferralProgram,
  useDeleteReferralProgram,
  useToggleReferralProgramActive,
  useAdminReferralCodes,
  useCreateReferralCode,
  useUpdateReferralCode,
  useDeleteReferralCode,
  useAdminReferrals,
  useUpdateReferralStatus,
  useDeleteReferral,
  ReferralProgram,
  ReferralCode,
  Referral,
} from "@/hooks/useAdminReferrals";

const rewardTypeLabels: Record<string, string> = {
  points: "Pontos",
  discount_fixed: "Desconto Fixo (R$)",
  discount_percentage: "Desconto (%)",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-500" },
  converted: { label: "Convertida", className: "bg-green-500/20 text-green-500" },
  expired: { label: "Expirada", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelada", className: "bg-red-500/20 text-red-500" },
};

function formatRewardValue(type: string, value: number) {
  if (type === "discount_percentage") return `${value}%`;
  if (type === "discount_fixed") return `R$ ${value.toFixed(2)}`;
  return `${value} pts`;
}

// ---------------- Programs Tab ----------------
function ProgramFormDialog({
  open,
  onOpenChange,
  program,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: ReferralProgram | null;
}) {
  const createProgram = useCreateReferralProgram();
  const updateProgram = useUpdateReferralProgram();

  const [referrerType, setReferrerType] = useState(program?.referrer_reward_type || "points");
  const [referrerValue, setReferrerValue] = useState(String(program?.referrer_reward_value ?? ""));
  const [referredType, setReferredType] = useState(program?.referred_discount_type || "points");
  const [referredValue, setReferredValue] = useState(String(program?.referred_discount_value ?? ""));
  const [isActive, setIsActive] = useState(program?.is_active ?? true);

  const isSubmitting = createProgram.isPending || updateProgram.isPending;

  const handleSubmit = () => {
    const payload = {
      referrer_reward_type: referrerType,
      referrer_reward_value: Number(referrerValue) || 0,
      referred_discount_type: referredType,
      referred_discount_value: Number(referredValue) || 0,
      is_active: isActive,
    };

    if (program) {
      updateProgram.mutate({ id: program.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createProgram.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{program ? "Editar Programa" : "Novo Programa de Indicação"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recompensa do Indicador</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={referrerType} onValueChange={setReferrerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rewardTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Valor"
                value={referrerValue}
                onChange={(e) => setReferrerValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recompensa do Indicado</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={referredType} onValueChange={setReferredType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rewardTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Valor"
                value={referredValue}
                onChange={(e) => setReferredValue(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="program-active">Programa ativo</Label>
            <Switch id="program-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {program ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProgramsTab() {
  const { data: programs = [], isLoading } = useAdminReferralPrograms();
  const toggleActive = useToggleReferralProgramActive();
  const deleteProgram = useDeleteReferralProgram();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ReferralProgram | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setEditingProgram(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Programa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum programa de indicação criado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recompensa Indicador</TableHead>
                  <TableHead>Recompensa Indicado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      {rewardTypeLabels[program.referrer_reward_type]} —{" "}
                      {formatRewardValue(program.referrer_reward_type, program.referrer_reward_value)}
                    </TableCell>
                    <TableCell>
                      {rewardTypeLabels[program.referred_discount_type]} —{" "}
                      {formatRewardValue(program.referred_discount_type, program.referred_discount_value)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={program.is_active}
                        onCheckedChange={(checked) =>
                          toggleActive.mutate({ id: program.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProgram(program);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(program.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProgramFormDialog open={formOpen} onOpenChange={setFormOpen} program={editingProgram} />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir programa?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) deleteProgram.mutate(deletingId);
                setDeletingId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------- Codes Tab ----------------
function CodeFormDialog({
  open,
  onOpenChange,
  code,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code?: ReferralCode | null;
}) {
  const createCode = useCreateReferralCode();
  const updateCode = useUpdateReferralCode();

  const [customerId, setCustomerId] = useState(code?.customer_id || "");
  const [codeValue, setCodeValue] = useState(code?.code || "");
  const [referralLink, setReferralLink] = useState(code?.referral_link || "");

  const isSubmitting = createCode.isPending || updateCode.isPending;

  const handleSubmit = () => {
    if (code) {
      updateCode.mutate(
        { id: code.id, code: codeValue, referral_link: referralLink || null },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createCode.mutate(
        { customer_id: customerId, code: codeValue, referral_link: referralLink || null },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{code ? "Editar Código" : "Novo Código de Indicação"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!code && (
            <div className="space-y-2">
              <Label>ID do Cliente</Label>
              <Input
                placeholder="UUID do cliente"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Código</Label>
            <Input placeholder="Ex: JOAO10" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Link de Indicação (opcional)</Label>
            <Input
              placeholder="https://..."
              value={referralLink}
              onChange={(e) => setReferralLink(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !codeValue || (!code && !customerId)}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {code ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CodesTab() {
  const { data: codes = [], isLoading } = useAdminReferralCodes();
  const deleteCode = useDeleteReferralCode();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ReferralCode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setEditingCode(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Código
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum código de indicação cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>{code.customers?.name || code.customers?.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{code.code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {code.referral_link || "—"}
                    </TableCell>
                    <TableCell>{code.usage_count}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCode(code);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(code.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CodeFormDialog open={formOpen} onOpenChange={setFormOpen} code={editingCode} />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir código?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) deleteCode.mutate(deletingId);
                setDeletingId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------- Referrals Tab ----------------
function ReferralsTab() {
  const { data: referrals = [], isLoading } = useAdminReferrals();
  const updateStatus = useUpdateReferralStatus();
  const deleteReferral = useDeleteReferral();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma indicação registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código do Indicador</TableHead>
                  <TableHead>Indicado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => {
                  const status = statusLabels[referral.status] || statusLabels.pending;
                  return (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <Badge variant="secondary">{referral.referral_codes?.code || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        {referral.referred_customer?.name ||
                          referral.referred_customer?.phone ||
                          referral.referred_customer_phone ||
                          "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{referral.reward_applied ? "Aplicada" : "Pendente"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {referral.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Marcar como convertida"
                              onClick={() => updateStatus.mutate({ id: referral.id, status: "converted" })}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancelar indicação"
                              onClick={() => updateStatus.mutate({ id: referral.id, status: "cancelled" })}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setDeletingId(referral.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir indicação?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) deleteReferral.mutate(deletingId);
                setDeletingId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------- Main Page ----------------
const AdminReferrals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programa de Indicação</h1>
        <p className="text-muted-foreground">
          Gerencie programas de indicação, códigos de clientes e acompanhe conversões
        </p>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList className="bg-surface">
          <TabsTrigger value="programs" className="gap-2">
            <Gift className="h-4 w-4" />
            Programas
          </TabsTrigger>
          <TabsTrigger value="codes" className="gap-2">
            <Link2 className="h-4 w-4" />
            Códigos
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-2">
            <Users className="h-4 w-4" />
            Indicações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab />
        </TabsContent>
        <TabsContent value="codes">
          <CodesTab />
        </TabsContent>
        <TabsContent value="referrals">
          <ReferralsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReferrals;
