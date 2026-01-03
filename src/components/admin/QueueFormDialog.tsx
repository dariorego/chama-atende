import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Users, Phone, MessageSquare, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateQueueEntry } from "@/hooks/useAdminQueue";

const formSchema = z.object({
  customer_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
  party_size: z.number().min(1, "Mínimo 1 pessoa").max(20, "Máximo 20 pessoas"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function QueueFormDialog() {
  const [open, setOpen] = useState(false);
  const createEntry = useCreateQueueEntry();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      party_size: 2,
      notes: "",
    },
  });

  const partySize = form.watch("party_size");

  const onSubmit = async (data: FormData) => {
    await createEntry.mutateAsync({
      customer_name: data.customer_name,
      phone: data.phone,
      party_size: data.party_size,
      notes: data.notes,
    });
    form.reset();
    setOpen(false);
  };

  const adjustPartySize = (delta: number) => {
    const newValue = Math.max(1, Math.min(20, partySize + delta));
    form.setValue("party_size", newValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar à Fila
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Cliente à Fila</DialogTitle>
          <DialogDescription>
            Adicione um cliente que chegou presencialmente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="party_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Pessoas</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustPartySize(-1)}
                        disabled={partySize <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 min-w-[80px] justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">{partySize}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustPartySize(1)}
                        disabled={partySize >= 20}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Ex: Cadeira de bebê, aniversário..."
                        className="pl-10 min-h-[80px]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createEntry.isPending}>
                {createEntry.isPending ? "Adicionando..." : "Adicionar à Fila"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
