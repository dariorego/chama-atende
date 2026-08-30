import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, UtensilsCrossed, Bell, Receipt, Star, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useTableContext } from "@/hooks/useTableContext";
import { useClientServiceCall } from "@/hooks/useClientServiceCall";
import { useCustomerName } from "@/hooks/useCustomerName";
import { CustomerNameDialog } from "@/components/CustomerNameDialog";
import { useToast } from "@/hooks/use-toast";

interface TableInfo {
  id: string;
  number: number;
  name: string | null;
  capacity: number | null;
}

const TableEntryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slug, tenant, isLoading: isTenantLoading } = useTenant();
  const { tableId } = useParams<{ tableId: string }>();
  const { setTable } = useTableContext();

  const [table, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<"waiter" | "bill" | null>(null);

  const { customerName, saveName } = useCustomerName();
  const { hasActiveCall, createCall, isCreatingCall } = useClientServiceCall(
    table?.id || null
  );

  useEffect(() => {
    const load = async () => {
      if (!tableId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("tables")
        .select("id, number, name, capacity, restaurant_id")
        .eq("id", tableId)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data || (tenant?.id && data.restaurant_id !== tenant.id)) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTableInfo(data);
      await setTable(data.id);
      setLoading(false);
    };
    if (!isTenantLoading) load();
  }, [tableId, tenant?.id, isTenantLoading, setTable]);

  const goto = (path: string) => navigate(slug ? `/${slug}${path}` : path);

  const sendCall = async (callType: "waiter" | "bill", name: string | null) => {
    if (!table?.id) return;
    if (hasActiveCall(callType, name)) {
      toast({ title: "Solicitação já enviada", description: "Aguarde o atendimento." });
      return;
    }
    try {
      await createCall({ tableId: table.id, sessionId: null, callType, customerName: name });
      toast({
        title: callType === "waiter" ? "Atendente chamado!" : "Conta solicitada!",
        description: callType === "waiter"
          ? `Um atendente está a caminho da sua mesa${name ? `, ${name}` : ""}.`
          : "Aguarde, a conta está sendo preparada.",
      });
    } catch {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const handleCall = (callType: "waiter" | "bill") => {
    if (!table?.id) return;
    if (!customerName) {
      setPendingType(callType);
      setNameDialogOpen(true);
      return;
    }
    void sendCall(callType, customerName);
  };

  if (loading || isTenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-6 bg-background text-foreground">
        <h1 className="text-2xl font-semibold">Mesa não encontrada</h1>
        <p className="text-muted-foreground text-center">
          Verifique o QR Code e tente novamente.
        </p>
      </div>
    );
  }

  const tableNumber = table.number.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-md rounded-3xl overflow-hidden border border-border shadow-xl bg-card">
        {/* Logo header */}
        <div className="flex items-center justify-center py-8 bg-card">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant?.name || "Logo"}
              className="h-24 w-24 object-contain rounded-full"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>

        {/* ATENDIMENTO badge */}
        <div className="bg-secondary/30 py-4 text-center">
          <p className="text-lg font-bold tracking-[0.3em] text-foreground">
            ATENDIMENTO
          </p>
        </div>

        {/* Mesa + actions */}
        <div className="p-6 space-y-4 bg-card">
          <div className="text-center py-2">
            <h1 className="text-4xl font-extrabold text-foreground tracking-wide">
              MESA {tableNumber}
            </h1>
            {table.name && (
              <p className="text-sm text-muted-foreground mt-1">{table.name}</p>
            )}
            <button
              onClick={() => {
                setPendingType(null);
                setNameDialogOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
            >
              <UserRound className="h-3 w-3" />
              {customerName ? `${customerName} · trocar nome` : "Informar meu nome"}
            </button>
          </div>

          <button
            onClick={() => goto("/cardapio")}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <UtensilsCrossed className="h-5 w-5" />
            Veja o Cardápio
          </button>

          <button
            onClick={() => handleCall("waiter")}
            disabled={isCreatingCall || hasActiveCall("waiter", customerName)}
            className="w-full py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            <Bell className="h-5 w-5" />
            {hasActiveCall("waiter", customerName) ? "Atendente a caminho..." : "Chamar Atendente"}
          </button>

          <button
            onClick={() => handleCall("bill")}
            disabled={isCreatingCall || hasActiveCall("bill", customerName)}
            className="w-full py-4 rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            <Receipt className="h-5 w-5" />
            {hasActiveCall("bill", customerName) ? "Preparando a conta..." : "Pedir a Conta"}
          </button>

          <button
            onClick={() => goto("/avaliacao")}
            className="w-full py-4 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <Star className="h-5 w-5" />
            Pesquisa de Satisfação
          </button>
        </div>

        {/* Footer */}
        <div className="bg-primary/10 py-4 text-center border-t border-border">
          <p className="text-sm font-bold tracking-widest text-primary">
            {tenant?.name?.toUpperCase() || "CHAMA-ATENDE"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Plataforma Ativa Tecnologia
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableEntryPage;