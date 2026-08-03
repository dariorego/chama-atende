import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bot, Loader2, Search, Send, Sparkles, UserRound } from "lucide-react";
import {
  useWhatsappConversations,
  useWhatsappInstances,
  useWhatsappManage,
  useWhatsappMessages,
} from "@/hooks/useWhatsappAi";
import { useAiPrompts, useAiSettings } from "@/hooks/useWhatsappAi";

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function initials(name?: string | null, phone?: string) {
  if (name?.trim()) {
    return name
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (phone ?? "?").slice(-2);
}

export function WhatsappConversations() {
  const { data: conversations, isLoading, setMode, markRead } = useWhatsappConversations();
  const { data: instances } = useWhatsappInstances();
  const { data: settings } = useAiSettings();
  const { data: prompts } = useAiPrompts();
  const manage = useWhatsappManage();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = conversations?.find((c) => c.id === selectedId) ?? null;
  const { data: messages, isLoading: loadingMessages } = useWhatsappMessages(selectedId);

  useEffect(() => {
    if (selectedId && selected?.unread_count) markRead.mutate(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selected?.unread_count]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations ?? [];
    return (conversations ?? []).filter((c) => {
      const contact = c.whatsapp_contacts;
      return (
        contact?.name?.toLowerCase().includes(term) ||
        contact?.phone?.includes(term.replace(/\D/g, "")) ||
        contact?.last_message?.toLowerCase().includes(term)
      );
    });
  }, [conversations, search]);

  const activeInstance = instances?.find((i) => i.id === selected?.instance_id);

  const sendMessage = async () => {
    if (!selected || !draft.trim() || !activeInstance) return;
    const text = draft.trim();
    setDraft("");
    try {
      await manage.mutateAsync({
        action: "send_message",
        instanceId: activeInstance.id,
        phone: selected.whatsapp_contacts?.phone,
        message: text,
      });
    } catch (err) {
      setDraft(text);
      toast.error(err instanceof Error ? err.message : "Falha ao enviar mensagem");
    }
  };

  const generateWithAi = async () => {
    if (!selected) return;
    const lastInbound = [...(messages ?? [])].reverse().find((m) => m.direction === "inbound" && m.message);
    if (!lastInbound?.message) {
      toast.error("Nenhuma mensagem do cliente para responder");
      return;
    }
    setGenerating(true);
    try {
      const activePrompt = prompts?.find((p) => p.is_active);
      const result = await manage.mutateAsync({
        action: "test_prompt",
        prompt: activePrompt?.prompt,
        model: settings?.model,
        input: lastInbound.message,
      });
      const content = (result as { result?: { content?: string } })?.result?.content;
      if (content) setDraft(content);
      else toast.error("A IA não retornou uma sugestão");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar resposta");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Lista de conversas */}
      <Card className="flex h-[640px] flex-col overflow-hidden">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contato ou telefone"
              className="bg-surface pl-9 placeholder:text-surface-foreground border-border focus:border-primary"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !filtered.length ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((conversation) => {
                const contact = conversation.whatsapp_contacts;
                const isSelected = conversation.id === selectedId;
                return (
                  <li key={conversation.id}>
                    <button
                      onClick={() => setSelectedId(conversation.id)}
                      className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {contact?.photo_url && <AvatarImage src={contact.photo_url} alt={contact.name ?? ""} />}
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials(contact?.name, contact?.phone)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{contact?.name ?? contact?.phone ?? "—"}</p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{contact?.last_message ?? "—"}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Badge variant={conversation.mode === "ai" ? "default" : "secondary"} className="text-[10px]">
                            {conversation.mode === "ai" ? "IA" : "Humano"}
                          </Badge>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-[10px]">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </Card>

      {/* Chat */}
      <Card className="flex h-[640px] flex-col overflow-hidden">
        {!selected ? (
          <CardContent className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Selecione uma conversa para ver as mensagens.</p>
          </CardContent>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selected.whatsapp_contacts?.name ?? selected.whatsapp_contacts?.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{selected.whatsapp_contacts?.phone} · {activeInstance?.name ?? "conexão"}
                </p>
              </div>
              <div className="flex gap-2">
                {selected.mode === "ai" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setMode.mutate({ id: selected.id, mode: "human" })}
                  >
                    <UserRound className="mr-1 h-3.5 w-3.5" /> Assumir atendimento
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setMode.mutate({ id: selected.id, mode: "ai" })}>
                    <Bot className="mr-1 h-3.5 w-3.5" /> Devolver para IA
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(messages ?? []).map((message) => {
                    const outbound = message.direction === "outbound";
                    return (
                      <div key={message.id} className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                            outbound
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface text-foreground border border-border"
                          }`}
                        >
                          {message.media_url && (
                            <img
                              src={message.media_url}
                              alt="Mídia recebida no WhatsApp"
                              className="mb-2 max-h-48 rounded-lg object-cover"
                            />
                          )}
                          <p className="whitespace-pre-wrap break-words">{message.message ?? `[${message.type}]`}</p>
                          <p className="mt-1 text-[10px] opacity-70">
                            {formatTime(message.created_at)}
                            {message.source === "ai" ? " · IA" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </ScrollArea>

            <div className="space-y-2 border-t border-border p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 4000))}
                placeholder="Escreva uma mensagem..."
                rows={2}
                className="bg-surface placeholder:text-surface-foreground border-border focus:border-primary"
              />
              <div className="flex justify-between gap-2">
                <Button size="sm" variant="outline" onClick={generateWithAi} disabled={generating}>
                  {generating ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                  )}
                  Gerar resposta com IA
                </Button>
                <Button size="sm" onClick={sendMessage} disabled={!draft.trim() || manage.isPending}>
                  {manage.isPending ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-3.5 w-3.5" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}