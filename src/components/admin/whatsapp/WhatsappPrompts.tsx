import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, Copy, GitBranch, Loader2, Play, Plus, Save, Trash2 } from "lucide-react";
import { useAiPrompts, useAiSettings, useWhatsappManage, type AiPrompt } from "@/hooks/useWhatsappAi";

const schema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(80, "Máximo de 80 caracteres"),
  prompt: z.string().trim().min(20, "O prompt precisa de ao menos 20 caracteres").max(8000, "Máximo de 8000 caracteres"),
});

const inputClass = "bg-surface placeholder:text-surface-foreground border-border focus:border-primary";

export function WhatsappPrompts() {
  const { data: prompts, isLoading, save, createVersion, duplicate, activate, remove } = useAiPrompts();
  const { data: settings } = useAiSettings();
  const manage = useWhatsappManage();

  const [selected, setSelected] = useState<AiPrompt | null>(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testInput, setTestInput] = useState("Vocês abrem no domingo?");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!prompts?.length || selected) return;
    const initial = prompts.find((p) => p.is_active) ?? prompts[0];
    setSelected(initial);
    setTitle(initial.title);
    setPrompt(initial.prompt);
  }, [prompts, selected]);

  const pick = (item: AiPrompt) => {
    setSelected(item);
    setTitle(item.title);
    setPrompt(item.prompt);
    setErrors({});
    setTestOutput(null);
  };

  const startNew = () => {
    setSelected(null);
    setTitle("");
    setPrompt("");
    setErrors({});
    setTestOutput(null);
  };

  const validate = () => {
    const parsed = schema.safeParse({ title, prompt });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
        ),
      );
      return null;
    }
    setErrors({});
    return parsed.data;
  };

  const handleSave = () => {
    const data = validate();
    if (!data) return;
    save.mutate({ id: selected?.id, title: data.title, prompt: data.prompt });
  };

  const handleNewVersion = () => {
    const data = validate();
    if (!data || !selected) return;
    createVersion.mutate({ source: selected, prompt: data.prompt });
  };

  const handleTest = async () => {
    const data = validate();
    if (!data) return;
    if (!testInput.trim()) {
      toast.error("Escreva uma mensagem de teste");
      return;
    }
    setTesting(true);
    setTestOutput(null);
    try {
      const result = await manage.mutateAsync({
        action: "test_prompt",
        prompt: data.prompt,
        model: settings?.model,
        input: testInput.trim().slice(0, 1000),
      });
      const content = (result as { result?: { content?: string } })?.result?.content;
      setTestOutput(content ?? "A IA não retornou conteúdo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao testar o prompt");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="flex h-fit flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Prompts</CardTitle>
          <Button size="sm" variant="secondary" onClick={startNew}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : !prompts?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum prompt criado.</p>
          ) : (
            prompts.map((item) => (
              <button
                key={item.id}
                onClick={() => pick(item)}
                className={`w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary ${
                  selected?.id === item.id ? "bg-primary/10" : "bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.is_active && <Badge className="text-[10px]">Ativo</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Versão {item.version}</p>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selected ? "Editar prompt" : "Novo prompt"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-title">Título</Label>
              <Input
                id="p-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ex.: Atendente do salão"
                className={inputClass}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-body">Instruções do sistema</Label>
              <Textarea
                id="p-body"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={12}
                maxLength={8000}
                placeholder="Você é o assistente virtual do estabelecimento. Responda de forma curta e cordial..."
                className={`${inputClass} font-mono text-xs`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.prompt ? <span className="text-destructive">{errors.prompt}</span> : <span />}
                <span>{prompt.length}/8000</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={save.isPending}>
                {save.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
              {selected && (
                <>
                  <Button variant="secondary" onClick={handleNewVersion} disabled={createVersion.isPending}>
                    <GitBranch className="mr-2 h-4 w-4" /> Nova versão
                  </Button>
                  <Button variant="outline" onClick={() => duplicate.mutate(selected)}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicar
                  </Button>
                  {!selected.is_active && (
                    <Button variant="outline" onClick={() => activate.mutate(selected.id)}>
                      <Check className="mr-2 h-4 w-4" /> Ativar
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      remove.mutate(selected.id);
                      startNew();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Testar prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="p-test">Mensagem do cliente</Label>
              <Input
                id="p-test"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                maxLength={1000}
                className={inputClass}
              />
            </div>
            <Button variant="secondary" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Executar teste
            </Button>
            {testOutput && (
              <div className="rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap">
                {testOutput}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}