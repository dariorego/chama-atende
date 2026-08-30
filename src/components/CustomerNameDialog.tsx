import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_CUSTOMER_NAME } from "@/hooks/useCustomerName";

interface CustomerNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome atual (quando o cliente está apenas trocando o nome). */
  initialName?: string | null;
  /** Recebe o nome informado (ou string vazia quando segue sem nome). */
  onConfirm: (name: string) => void;
  allowSkip?: boolean;
}

export function CustomerNameDialog({
  open,
  onOpenChange,
  initialName,
  onConfirm,
  allowSkip = true,
}: CustomerNameDialogProps) {
  const [value, setValue] = useState(initialName ?? "");

  useEffect(() => {
    if (open) setValue(initialName ?? "");
  }, [open, initialName]);

  const submit = (name: string) => {
    onOpenChange(false);
    onConfirm(name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Como podemos te chamar?</DialogTitle>
          <DialogDescription>
            Seu nome fica salvo neste celular e acompanha todos os seus chamados.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            submit(value);
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            value={value}
            maxLength={MAX_CUSTOMER_NAME}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Seu nome"
            className="bg-surface placeholder:text-surface-foreground border-border focus:ring-primary"
          />

          <DialogFooter className="gap-2 sm:justify-between">
            {allowSkip && (
              <Button type="button" variant="ghost" onClick={() => submit("")}>
                Continuar sem nome
              </Button>
            )}
            <Button type="submit" disabled={!value.trim()}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
