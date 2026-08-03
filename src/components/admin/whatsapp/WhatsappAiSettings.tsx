import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { useAiSettings, type AiSettings } from "@/hooks/useWhatsappAi";

export const OPENROUTER_MODELS = [
  { value: "openai/gpt-4o-mini", label: "GPT-4o mini (rápido e barato)" },
  { value: "openai/gpt-4o", label: "GPT-4o (mais capaz)" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku (econômico)" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
  { value: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
];

const DEFAULTS: Partial<AiSettings> = {
  enabled: false,
  model: "openai/gpt-4o-mini",
  temperature: 0.7,
  top_p: 1,
  max_tokens: 500,
  timeout_ms: 30000,
  retry: 1,
  welcome_message: "",
  fallback_message: "Não consegui entender. Um atendente vai falar com você em breve.",
  reply_delay_ms: 1500,
  abandon_minutes: 30,
};

const inputClass = "bg-surface placeholder:text-surface-foreground border-border focus:border-primary";

export function WhatsappAiSettings() {
  const { data, isLoading, save } = useAiSettings();
  const [form, setForm] = useState<Partial<AiSettings>>(DEFAULTS);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading) return <Skeleton className="h-96" />;

  const handleSave = () => {
    save.mutate({
      enabled: !!form.enabled,
      model: form.model ?? DEFAULTS.model!,
      temperature: Number(form.temperature ?? 0.7),
      top_p: Number(form.top_p ?? 1),
      max_tokens: Number(form.max_tokens ?? 500),
      timeout_ms: Number(form.timeout_ms ?? 30000),
      retry: Number(form.retry ?? 1),
      welcome_message: form.welcome_message?.trim() || null,
      fallback_message: form.fallback_message?.trim() || DEFAULTS.fallback_message!,
      reply_delay_ms: Number(form.reply_delay_ms ?? 1500),
      abandon_minutes: Number(form.abandon_minutes ?? 30),
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-surface">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Respostas automáticas</CardTitle>
            <CardDescription>Quando desligado, nenhuma mensagem é respondida pela IA.</CardDescription>
          </div>
          <Switch checked={!!form.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modelo e parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Modelo (OpenRouter)</Label>
            <Select value={form.model ?? ""} onValueChange={(v) => set("model", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {OPENROUTER_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Temperatura: {Number(form.temperature ?? 0.7).toFixed(2)}</Label>
            <Slider
              value={[Number(form.temperature ?? 0.7)]}
              min={0}
              max={2}
              step={0.05}
              onValueChange={([v]) => set("temperature", v)}
            />
          </div>

          <div className="space-y-3">
            <Label>Top P: {Number(form.top_p ?? 1).toFixed(2)}</Label>
            <Slider
              value={[Number(form.top_p ?? 1)]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => set("top_p", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-tokens">Máx. de tokens por resposta</Label>
            <Input
              id="max-tokens"
              type="number"
              min={50}
              max={4000}
              value={form.max_tokens ?? 500}
              onChange={(e) => set("max_tokens", Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              min={5000}
              max={120000}
              step={1000}
              value={form.timeout_ms ?? 30000}
              onChange={(e) => set("timeout_ms", Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retry">Tentativas em caso de falha</Label>
            <Input
              id="retry"
              type="number"
              min={0}
              max={5}
              value={form.retry ?? 1}
              onChange={(e) => set("retry", Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay">Atraso antes de responder (ms)</Label>
            <Input
              id="delay"
              type="number"
              min={0}
              max={20000}
              step={500}
              value={form.reply_delay_ms ?? 1500}
              onChange={(e) => set("reply_delay_ms", Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abandon">Encerrar conversa inativa após (min)</Label>
            <Input
              id="abandon"
              type="number"
              min={5}
              max={1440}
              value={form.abandon_minutes ?? 30}
              onChange={(e) => set("abandon_minutes", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensagens padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome">Mensagem de boas-vindas (primeiro contato)</Label>
            <Textarea
              id="welcome"
              rows={3}
              maxLength={1000}
              value={form.welcome_message ?? ""}
              onChange={(e) => set("welcome_message", e.target.value)}
              placeholder="Olá! Sou o assistente virtual do nosso estabelecimento..."
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fallback">Mensagem de fallback (quando a IA falha)</Label>
            <Textarea
              id="fallback"
              rows={3}
              maxLength={1000}
              value={form.fallback_message ?? ""}
              onChange={(e) => set("fallback_message", e.target.value)}
              className={inputClass}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}