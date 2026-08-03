# Módulo WhatsApp AI

Módulo desacoplado de atendimento por WhatsApp, com Evolution API para conexão/mensageria e OpenRouter para respostas automáticas. Acesso restrito a owner/admin do slug. Fundação completa nesta etapa.

## Decisões já definidas

- Evolution API: URL e API Key globais da plataforma, guardadas como secrets no backend (nunca no front).
- OpenRouter: chave única da plataforma, guardada como secret.
- Cada estabelecimento (`restaurant_id`) tem suas próprias instâncias, contatos, conversas, prompts e configurações de IA.
- Acesso: módulo `whatsapp_ai` ativável em Módulos, mas restrito a owner/admin (entra em `ADMIN_ONLY_SECTIONS`).

## Secrets necessários

Vou solicitar em seguida: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `OPENROUTER_API_KEY`, e gerar `WHATSAPP_WEBHOOK_SECRET` automaticamente para proteger o webhook.

## Fase 1 — Banco de dados (migração única)

Todas as tabelas com `restaurant_id`, RLS via `has_tenant_admin(restaurant_id)`, GRANTs para `authenticated` e `service_role` (sem `anon`), `created_at`/`updated_at` com trigger.

- `whatsapp_instances` — name, instance_name, phone, status (`disconnected|qr|connecting|connected|error`), qr_code, last_error, connected_at
- `whatsapp_contacts` — phone, name, photo_url, last_message, last_seen (único por instância+telefone)
- `whatsapp_conversations` — contact_id, instance_id, mode (`ai|human`), status (`open|closed`), assigned_to, last_message_at, unread_count
- `whatsapp_messages` — conversation_id, phone, direction (`inbound|outbound`), message, media_url, type, status, source (`ai|human|system`), tokens_prompt, tokens_completion, external_id, response_ms
- `ai_prompts` — title, prompt, version, is_active, parent_id (versionamento/duplicação)
- `ai_settings` — enabled, model, temperature, top_p, max_tokens, timeout_ms, retry, welcome_message, fallback_message, reply_delay_ms, abandon_minutes (1 linha por estabelecimento)
- `whatsapp_logs` — kind (`evolution|openrouter|webhook|error`), action, status_code, duration_ms, request/response resumidos, error

Realtime habilitado em `whatsapp_messages` e `whatsapp_conversations` para atualização ao vivo do chat e do QR Code.

Credenciais não ficam em tabela — só em secrets.

## Fase 2 — Backend (edge functions, camadas isoladas)

`supabase/functions/_shared/whatsapp/` — camada de serviços reutilizável:
- `evolution.service.ts`: createInstance, deleteInstance, connect/getQrCode, getStatus, restart, sendText, sendMedia, downloadMedia, setWebhook
- `openrouter.service.ts`: chat completion com timeout, retry e retorno de uso de tokens
- `repositories.ts`: acesso a instâncias, contatos, conversas, mensagens, prompts, settings, logs (Repository Pattern)
- `logger.ts`: log estruturado em `whatsapp_logs`
- `types.ts`: interfaces de domínio

Funções:
1. `whatsapp-manage` (autenticada, valida JWT + `has_tenant_admin`): ações `create_instance`, `delete_instance`, `qrcode`, `status`, `restart`, `disconnect`, `send_message`, `test_prompt`. Único ponto de contato do front com a Evolution/OpenRouter.
2. `whatsapp-webhook` (pública, valida `WHATSAPP_WEBHOOK_SECRET` na URL/header): trata `MESSAGE_RECEIVED`, `MESSAGE_SENT`, `QRCODE_UPDATED`, `CONNECTION_OPEN`, `CONNECTION_CLOSE`, `INSTANCE_CREATED`, `INSTANCE_DELETED`. No `MESSAGE_RECEIVED` executa o fluxo da IA: salvar mensagem → upsert contato/conversa → se modo `ai` e IA ativa, montar contexto (prompt ativo + histórico) → OpenRouter → salvar resposta → enviar pela Evolution → registrar logs e tokens.

Validação de payloads com Zod em ambas as funções.

## Fase 3 — Frontend

Rotas em `/admin/:slug/whatsapp/*` com layout próprio e abas: Dashboard, Conexões, Conversas, Chatbot IA, Prompts, Configurações, Logs.

- **Dashboard**: cards de status da instância, número, mensagens hoje (recebidas/enviadas), conversas abertas, respondidas pela IA, tempo médio de resposta, tokens e custo estimado.
- **Conexões**: CRUD de instâncias (nome + nome da instância), botões Conectar / Gerar QR / Atualizar QR / Desconectar / Reiniciar, QR Code exibido automaticamente e atualizado via Realtime, badge de status.
- **Conversas**: layout estilo WhatsApp Web — lista de contatos à esquerda (foto, nome, telefone, última mensagem, hora, badge IA/Humano) e chat à direita, com envio manual, "gerar resposta com IA", assumir atendimento e devolver para IA.
- **Chatbot IA**: ativar IA, modelo, temperatura, top_p, max tokens, boas-vindas, delay, tempo de abandono, resposta de fallback.
- **Prompts**: editor com salvar, versionar, restaurar versão, duplicar e testar prompt (chamada real ao modelo).
- **Configurações**: modelo padrão, timeout, retry, limites e a URL do webhook para copiar e colar na Evolution. Nenhuma chave é exibida.
- **Logs**: tabela filtrável por tipo/status com detalhe da chamada e duração.

Hooks por domínio (`useWhatsappInstances`, `useWhatsappConversations`, `useWhatsappMessages`, `useAiPrompts`, `useAiSettings`, `useWhatsappLogs`) usando React Query, com loading states, toasts e validação de formulário via Zod. Estilo seguindo os tokens semânticos e as cores do estabelecimento (`bg-surface`, `placeholder:text-surface-foreground`, etc.).

Registro do módulo: `whatsapp_ai` em `MODULE_INFO`, seção `whatsapp` em `ADMIN_SECTIONS` + `ADMIN_ONLY_SECTIONS`, item no menu de `AdminLayout` condicionado ao módulo ativo, e backfill do módulo para os estabelecimentos existentes.

## Detalhes técnicos

- Nenhuma credencial no bundle: todo tráfego para Evolution/OpenRouter passa por edge function.
- Webhook protegido por segredo em query string, além de validação do payload e da instância pertencer a um estabelecimento existente.
- Retry com backoff em OpenRouter e Evolution; falhas gravadas em `whatsapp_logs` e refletidas no status da instância.
- Estrutura preparada para multi-instância, múltiplos prompts/modelos, filas e atendentes (campos `assigned_to`, `mode`, `parent_id` já previstos), e para Function Calling/RAG via extensão do `openrouter.service`.
- `planoWhatsapp.md` criado no repositório com as fases e checklist.

## Fora desta etapa

Gráficos históricos no dashboard, campanhas, agendamento, RAG, MCP, Telegram/Instagram e testes automatizados dos serviços (Fases 8+ do plano).
