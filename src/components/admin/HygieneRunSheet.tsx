import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  ANSWER_LABELS,
  SHIFT_LABELS,
  isOutOfRange,
  rangeLabel,
  useCompleteRun,
  useSaveAnswer,
  type HygieneAnswerValue,
  type HygieneChecklist,
  type HygieneChecklistItem,
  type HygieneShift,
  type RunWithRelations,
} from "@/hooks/useHygiene";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: RunWithRelations | null;
  checklist?: (HygieneChecklist & { hygiene_checklist_items: HygieneChecklistItem[] }) | null;
};

type LocalAnswer = {
  answer: HygieneAnswerValue | "";
  numeric_value: string;
  text_value: string;
  corrective_action: string;
};

const blank: LocalAnswer = { answer: "", numeric_value: "", text_value: "", corrective_action: "" };

export function HygieneRunSheet({ open, onOpenChange, run, checklist }: Props) {
  const saveAnswer = useSaveAnswer();
  const completeRun = useCompleteRun();
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const items = useMemo(() => checklist?.hygiene_checklist_items ?? [], [checklist]);
  const readOnly = run?.status === "CONCLUIDO";

  useEffect(() => {
    if (!open || !run) return;
    const map: Record<string, LocalAnswer> = {};
    for (const item of items) {
      const existing = run.hygiene_checklist_answers?.find((a) => a.item_id === item.id);
      map[item.id] = existing
        ? {
            answer: (existing.answer as HygieneAnswerValue) ?? "",
            numeric_value: existing.numeric_value === null ? "" : String(existing.numeric_value),
            text_value: existing.text_value ?? "",
            corrective_action: existing.corrective_action ?? "",
          }
        : { ...blank };
    }
    setAnswers(map);
    setNotes(run.notes ?? "");
  }, [open, run, items]);

  const set = (itemId: string, patch: Partial<LocalAnswer>) =>
    setAnswers((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? blank), ...patch } }));

  const nonConformities = items.filter((item) => {
    const a = answers[item.id];
    if (!a) return false;
    if (a.answer === "NAO_CONFORME") return true;
    if (item.item_type === "NUMERICO" && a.numeric_value !== "") {
      return isOutOfRange(item, Number(a.numeric_value.replace(",", ".")));
    }
    return false;
  });

  const validate = (requireAll: boolean) => {
    for (const item of items) {
      const a = answers[item.id] ?? blank;
      const answered =
        (item.item_type === "CONFORMIDADE" && a.answer !== "") ||
        (item.item_type === "NUMERICO" && a.numeric_value !== "") ||
        (item.item_type === "TEXTO" && a.text_value.trim() !== "");
      if (requireAll && item.is_required && !answered) {
        toast.error(`Preencha o item obrigatório: ${item.label}`);
        return false;
      }
      if (item.item_type === "NUMERICO" && a.numeric_value !== "") {
        const value = Number(a.numeric_value.replace(",", "."));
        if (Number.isNaN(value)) {
          toast.error(`Valor inválido em: ${item.label}`);
          return false;
        }
        if (requireAll && isOutOfRange(item, value) && !a.corrective_action.trim()) {
          toast.error(`Informe a ação corretiva para: ${item.label}`);
          return false;
        }
      }
      if (requireAll && a.answer === "NAO_CONFORME" && !a.corrective_action.trim()) {
        toast.error(`Informe a ação corretiva para: ${item.label}`);
        return false;
      }
    }
    return true;
  };

  const persist = async () => {
    if (!run) return;
    for (const item of items) {
      const a = answers[item.id] ?? blank;
      const numeric = a.numeric_value === "" ? null : Number(a.numeric_value.replace(",", "."));
      await saveAnswer.mutateAsync({
        run_id: run.id,
        item_id: item.id,
        answer: item.item_type === "CONFORMIDADE" ? (a.answer || null) : null,
        numeric_value: item.item_type === "NUMERICO" ? numeric : null,
        text_value: item.item_type === "TEXTO" ? a.text_value.trim() || null : null,
        corrective_action: a.corrective_action.trim() || null,
      });
    }
  };

  const handleSave = async (finish: boolean) => {
    if (!run) return;
    if (!validate(finish)) return;
    setSaving(true);
    try {
      await persist();
      if (finish) {
        await completeRun.mutateAsync({ id: run.id, notes: notes.trim() || null });
        toast.success("Checklist concluído");
        onOpenChange(false);
      } else {
        toast.success("Respostas salvas");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar respostas");
    } finally {
      setSaving(false);
    }
  };

  if (!run) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {checklist?.name ?? "Checklist"} · {SHIFT_LABELS[run.shift as HygieneShift]} ·{" "}
            {new Date(run.run_date + "T00:00:00").toLocaleDateString("pt-BR")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={readOnly ? "secondary" : "default"}>
            {readOnly ? "Concluído" : "Em andamento"}
          </Badge>
          <span className="text-muted-foreground">Responsável: {run.performed_by_name ?? "-"}</span>
          {nonConformities.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {nonConformities.length} não conformidade(s)
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Este modelo não possui itens cadastrados.</p>
          )}
          {items.map((item) => {
            const a = answers[item.id] ?? blank;
            const numeric = a.numeric_value === "" ? null : Number(a.numeric_value.replace(",", "."));
            const out =
              a.answer === "NAO_CONFORME" ||
              (item.item_type === "NUMERICO" && isOutOfRange(item, numeric));
            return (
              <div
                key={item.id}
                className={`rounded-md border p-3 space-y-2 ${out ? "border-destructive" : "border-border"} bg-surface`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {item.label}
                      {item.is_required && <span className="text-destructive"> *</span>}
                    </p>
                    {item.item_type === "NUMERICO" && rangeLabel(item) && (
                      <p className="text-xs text-muted-foreground">{rangeLabel(item)}</p>
                    )}
                  </div>
                  {out && <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />}
                </div>

                {item.item_type === "CONFORMIDADE" && (
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(ANSWER_LABELS) as HygieneAnswerValue[]).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        disabled={readOnly}
                        variant={a.answer === opt ? (opt === "NAO_CONFORME" ? "destructive" : "default") : "outline"}
                        onClick={() => set(item.id, { answer: opt })}
                      >
                        {ANSWER_LABELS[opt]}
                      </Button>
                    ))}
                  </div>
                )}

                {item.item_type === "NUMERICO" && (
                  <div className="flex items-end gap-2">
                    <div className="w-32">
                      <Label className="text-xs">Valor {item.unit ? `(${item.unit})` : ""}</Label>
                      <Input
                        value={a.numeric_value}
                        disabled={readOnly}
                        onChange={(e) => set(item.id, { numeric_value: e.target.value })}
                        placeholder="0"
                        className="bg-surface placeholder:text-surface-foreground"
                      />
                    </div>
                  </div>
                )}

                {item.item_type === "TEXTO" && (
                  <Textarea
                    value={a.text_value}
                    disabled={readOnly}
                    onChange={(e) => set(item.id, { text_value: e.target.value })}
                    placeholder="Observação"
                    className="bg-surface placeholder:text-surface-foreground"
                  />
                )}

                {out && (
                  <div>
                    <Label className="text-xs">Ação corretiva *</Label>
                    <Textarea
                      value={a.corrective_action}
                      disabled={readOnly}
                      onChange={(e) => set(item.id, { corrective_action: e.target.value })}
                      placeholder="Descreva a ação tomada"
                      className="bg-surface placeholder:text-surface-foreground"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <Label className="text-xs">Observações gerais</Label>
          <Textarea
            value={notes}
            disabled={readOnly}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-surface placeholder:text-surface-foreground"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!readOnly && (
            <>
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
                Salvar parcial
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                Concluir turno
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
