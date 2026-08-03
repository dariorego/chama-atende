import { useState } from "react";
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Crown,
  Star,
  History,
  Users,
  Loader2,
  Settings2,
} from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminLoyaltyCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useAdminLoyaltyBalances,
  useAdminLoyaltyProgram,
  useUpsertLoyaltyProgram,
  useAdminLoyaltyTiers,
  useCreateLoyaltyTier,
  useUpdateLoyaltyTier,
  useDeleteLoyaltyTier,
  useToggleLoyaltyTierActive,
  useAdminLoyaltyRewards,
  useCreateLoyaltyReward,
  useUpdateLoyaltyReward,
  useDeleteLoyaltyReward,
  useToggleLoyaltyRewardActive,
  useAdminLoyaltyTransactions,
  useCreateLoyaltyTransaction,
  Customer,
  CustomerLoyaltyBalance,
  LoyaltyProgram,
  LoyaltyTier,
  LoyaltyReward,
  LoyaltyTransaction,
} from "@/hooks/useAdminLoyalty";

const transactionTypeLabels: Record<string, string> = {
  earn: "Ganho",
  redeem: "Resgate",
  adjustment: "Ajuste",
  welcome: "Boas-vindas",
  referral: "Indicação",
};

const rewardTypeLabels: Record<string, string> = {
  percentage: "Desconto (%)",
  fixed: "Desconto fixo (R$)",
  free_product: "Produto grátis",
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPhone(phone: string) {
  if (!phone) return "-";
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

// ---------------- Program Tab ----------------
function ProgramTab() {
  const { data: program, isLoading } = useAdminLoyaltyProgram();
  const upsert = useUpsertLoyaltyProgram();

  const [pointsPerCurrency, setPointsPerCurrency] = useState("");
  const [currencyValuePerPoint, setCurrencyValuePerPoint] = useState("");
  const [welcomePoints, setWelcomePoints] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when program data loads
  if (program && pointsPerCurrency === "" && pointsPerCurrency !== String(program.points_per_currency)) {
    setPointsPerCurrency(String(program.points_per_currency));
    setCurrencyValuePerPoint(String(program.currency_value_per_point));
    setWelcomePoints(String(program.welcome_points));
    setIsActive(program.is_active);
  }

  const handleSubmit = () => {
    upsert.mutate({
      id: program?.id,
      points_per_currency: Number(pointsPerCurrency) || 1,
      currency_value_per_point: Number(currencyValuePerPoint) || 0,
      welcome_points: Number(welcomePoints) || 0,
      is_active: isActive,
      status: isActive ? "active" : "inactive",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> Configuração do Programa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Pontos por R$ gasto</Label>
            <Input
              type="number"
              value={pointsPerCurrency}
              onChange={(e) => setPointsPerCurrency(e.target.value)}
              placeholder="Ex: 1"
            />
          </div>
          <div className="space-y-2">
            <Label>Valor do ponto (R$)</Label>
            <Input
              type="number"
              value={currencyValuePerPoint}
              onChange={(e) => setCurrencyValuePerPoint(e.target.value)}
              placeholder="Ex: 0.05"
            />
          </div>
          <div className="space-y-2">
            <Label>Pontos de boas-vindas</Label>
            <Input
              type="number"
              value={welcomePoints}
              onChange={(e) => setWelcomePoints(e.target.value)}
              placeholder="Ex: 100"
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label htmlFor="program-active" className="cursor-pointer">Programa ativo</Label>
          <Switch id="program-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <Button onClick={handleSubmit} disabled={upsert.isPending}>
          {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Configuração
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------- Customers Tab ----------------
function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}) {
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");

  const handleSubmit = () => {
    const payload = {
      name: name.trim() || null,
      phone: phone.replace(/\D/g, ""),
      email: email.trim() || null,
    };
    if (customer) {
      update.mutate({ id: customer.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!phone.replace(/\D/g, "")}>
            {customer ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Tiers Tab ----------------
function TierFormDialog({
  open,
  onOpenChange,
  tier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: LoyaltyTier | null;
}) {
  const create = useCreateLoyaltyTier();
  const update = useUpdateLoyaltyTier();
  const [name, setName] = useState(tier?.name || "");
  const [minPoints, setMinPoints] = useState(String(tier?.min_points ?? ""));
  const [multiplier, setMultiplier] = useState(String(tier?.multiplier ?? 1));
  const [color, setColor] = useState(tier?.color || "#f59e0b");
  const [icon, setIcon] = useState(tier?.icon || "Star");
  const [displayOrder, setDisplayOrder] = useState(String(tier?.display_order ?? 0));
  const [isActive, setIsActive] = useState(tier?.is_active ?? true);

  const handleSubmit = () => {
    const payload = {
      name: name.trim(),
      min_points: Number(minPoints) || 0,
      multiplier: Number(multiplier) || 1,
      color: color.trim() || null,
      icon: icon.trim() || null,
      display_order: Number(displayOrder) || 0,
      is_active: isActive,
    };
    if (tier) {
      update.mutate({ id: tier.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tier ? "Editar Nível" : "Novo Nível"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ouro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pontos mínimos</Label>
              <Input type="number" value={minPoints} onChange={(e) => setMinPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Multiplicador</Label>
              <Input type="number" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Star" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ordem de exibição</Label>
            <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="tier-active" className="cursor-pointer">Ativo</Label>
            <Switch id="tier-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {tier ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Rewards Tab ----------------
function RewardFormDialog({
  open,
  onOpenChange,
  reward,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward?: LoyaltyReward | null;
}) {
  const create = useCreateLoyaltyReward();
  const update = useUpdateLoyaltyReward();
  const [name, setName] = useState(reward?.name || "");
  const [description, setDescription] = useState(reward?.description || "");
  const [pointsCost, setPointsCost] = useState(String(reward?.points_cost ?? ""));
  const [discountType, setDiscountType] = useState(reward?.discount_type || "percentage");
  const [discountValue, setDiscountValue] = useState(String(reward?.discount_value ?? ""));
  const [displayOrder, setDisplayOrder] = useState(String(reward?.display_order ?? 0));
  const [isActive, setIsActive] = useState(reward?.is_active ?? true);

  const handleSubmit = () => {
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      points_cost: Number(pointsCost) || 0,
      discount_type: discountType,
      discount_value: Number(discountValue) || 0,
      display_order: Number(displayOrder) || 0,
      is_active: isActive,
    };
    if (reward) {
      update.mutate({ id: reward.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{reward ? "Editar Recompensa" : "Nova Recompensa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 10% de desconto" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes da recompensa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custo em pontos</Label>
              <Input type="number" value={pointsCost} onChange={(e) => setPointsCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de desconto</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  <SelectItem value="free_product">Produto grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor do desconto</Label>
              <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="reward-active" className="cursor-pointer">Ativa</Label>
            <Switch id="reward-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {reward ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Transaction Dialog ----------------
function TransactionDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerLoyaltyBalance | null;
}) {
  const create = useCreateLoyaltyTransaction();
  const [type, setType] = useState("earn");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!customer) return;
    create.mutate(
      {
        customer_id: customer.customer_id,
        points: Number(points) || 0,
        type,
        description: description.trim() || null,
        order_id: null,
        reward_id: null,
        coupon_id: null,
        referral_id: null,
        created_by: null,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lançar Pontos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input value={customer?.customers?.name || customer?.customers?.phone || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earn">Crédito</SelectItem>
                <SelectItem value="redeem">Débito</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pontos</Label>
            <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Use negativo para débito" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Motivo do lançamento" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!points}>
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Main Page ----------------
export default function AdminLoyalty() {
  const [activeTab, setActiveTab] = useState("customers");
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [transactionCustomer, setTransactionCustomer] = useState<CustomerLoyaltyBalance | null>(null);
  const [transactionOpen, setTransactionOpen] = useState(false);

  const [tierFormOpen, setTierFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [tierDeletingId, setTierDeletingId] = useState<string | null>(null);

  const [rewardFormOpen, setRewardFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [rewardDeletingId, setRewardDeletingId] = useState<string | null>(null);

  const { data: customers, isLoading: customersLoading } = useAdminLoyaltyCustomers();
  const { data: balances, isLoading: balancesLoading } = useAdminLoyaltyBalances();
  const { data: tiers, isLoading: tiersLoading } = useAdminLoyaltyTiers();
  const { data: rewards, isLoading: rewardsLoading } = useAdminLoyaltyRewards();
  const { data: transactions, isLoading: transactionsLoading } = useAdminLoyaltyTransactions();
  const deleteTier = useDeleteLoyaltyTier();
  const deleteReward = useDeleteLoyaltyReward();
  const toggleTier = useToggleLoyaltyTierActive();
  const toggleReward = useToggleLoyaltyRewardActive();
  const deleteCustomer = useDeleteCustomer();

  const balanceByCustomer = new Map(balances?.map((b) => [b.customer_id, b]) ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fidelidade e Cashback</h1>
          <p className="text-muted-foreground">Gerencie clientes, níveis, recompensas e pontos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" /> Clientes
          </TabsTrigger>
          <TabsTrigger value="program">
            <Settings2 className="h-4 w-4 mr-2" /> Programa
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Crown className="h-4 w-4 mr-2" /> Níveis
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" /> Recompensas
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" /> Extrato
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingCustomer(null);
                setCustomerFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Clientes e Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading || balancesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(customers || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum cliente cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers!.map((customer) => {
                        const balance = balanceByCustomer.get(customer.id);
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.name || "—"}</TableCell>
                            <TableCell>{formatPhone(customer.phone)}</TableCell>
                            <TableCell className="font-medium">{balance?.points_balance ?? 0}</TableCell>
                            <TableCell>
                              {balance?.loyalty_tiers?.name ? (
                                <Badge style={{ backgroundColor: balance.loyalty_tiers.color || undefined }}>
                                  {balance.loyalty_tiers.name}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setTransactionCustomer(balance || null);
                                    setTransactionOpen(true);
                                  }}
                                  title="Lançar pontos"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setCustomerFormOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCustomer.mutate(customer.id)}>
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program">
          <ProgramTab />
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingTier(null);
                setTierFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Nível
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4" /> Níveis de Fidelidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tiersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Pontos mínimos</TableHead>
                      <TableHead>Multiplicador</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tiers || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum nível cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      tiers!.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tier.color || "#ccc" }}
                              />
                              {tier.name}
                            </span>
                          </TableCell>
                          <TableCell>{tier.min_points}</TableCell>
                          <TableCell>{tier.multiplier}x</TableCell>
                          <TableCell>
                            <Switch
                              checked={tier.is_active}
                              onCheckedChange={(v) => toggleTier.mutate({ id: tier.id, is_active: v })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTier(tier);
                                  setTierFormOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setTierDeletingId(tier.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir nível</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o nível "{tier.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTier.mutate(tier.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingReward(null);
                setRewardFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Recompensa
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4" /> Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewardsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Custo em pontos</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ativa</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(rewards || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma recompensa cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      rewards!.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>{reward.name}</TableCell>
                          <TableCell>{reward.points_cost}</TableCell>
                          <TableCell>{rewardTypeLabels[reward.discount_type] || reward.discount_type}</TableCell>
                          <TableCell>
                            {reward.discount_type === "percentage" ? `${reward.discount_value}%` : formatCurrency(reward.discount_value)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={reward.is_active}
                              onCheckedChange={(v) => toggleReward.mutate({ id: reward.id, is_active: v })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingReward(reward);
                                  setRewardFormOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setRewardDeletingId(reward.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir recompensa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir "{reward.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteReward.mutate(reward.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Extrato de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(transactions || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhuma transação registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions!.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{new Date(t.created_at).toLocaleString("pt-BR")}</TableCell>
                          <TableCell>{t.customers?.name || t.customers?.phone || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transactionTypeLabels[t.type] || t.type}</Badge>
                          </TableCell>
                          <TableCell className={t.points >= 0 ? "text-green-500" : "text-red-500"}>
                            {t.points > 0 ? `+${t.points}` : t.points}
                          </TableCell>
                          <TableCell>{t.description || "—"}</TableCell>
                        </TableRow>
                      )))
                    }
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerFormDialog
        open={customerFormOpen}
        onOpenChange={setCustomerFormOpen}
        customer={editingCustomer}
      />
      <TierFormDialog open={tierFormOpen} onOpenChange={setTierFormOpen} tier={editingTier} />
      <RewardFormDialog open={rewardFormOpen} onOpenChange={setRewardFormOpen} reward={editingReward} />
      <TransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        customer={transactionCustomer}
      />
    </div>
  );
}
