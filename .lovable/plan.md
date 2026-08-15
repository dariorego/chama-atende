# Ajustes: nomes no cardápio, som repetido e volume até 200%

## 1. Nomes dos produtos sem "..."
O código atual do card de produto (`src/components/ui/product-card.tsx`) já usa `break-words` sem `line-clamp` no nome — a tela enviada é do endereço publicado (`plataforma.chamaatende.com`), que ainda roda o build anterior. Mesmo assim, vou reforçar a quebra:
- Adicionar `hyphens-auto`/`overflow-wrap: anywhere` no título para nomes longos com hífen (ex. "TAPIOCA- CHARQUE") quebrarem sem cortar.
- Garantir a mesma regra no título do pop-up de detalhes e no carrossel "Sugestão do Chef", que hoje mantém `line-clamp-2` na descrição (o nome fica livre).
- Depois de aprovado, é preciso republicar para o domínio refletir a mudança.

## 2. Som repetido a cada X segundos
Em **Configurações → Notificações**:
- Novo switch "Repetir som enquanto houver chamado pendente".
- Novo campo numérico "Repetir a cada (segundos)" — digitável, padrão 30s, mínimo 5s.
- Salvos em `notification_settings` (JSONB, sem migração): `sound_repeat_enabled`, `sound_repeat_seconds`.
- Novo hook de repetição usado nas telas de admin/chamados: enquanto existir pelo menos um chamado com status pendente, toca o som escolhido no intervalo configurado; para automaticamente quando todos são atendidos/cancelados.

## 3. Volume até 200%
- Slider de volume passa de 0–100 para 0–200 (passo de 10), com o valor exibido em %.
- O gerador Web Audio (`useNotificationSound`) deixa de limitar o ganho em 1.0 e passa a aceitar até 2.0, mantendo um limitador leve para evitar distorção/clipping alto.

## Técnico
Arquivos afetados: `src/types/restaurant.ts` (novos campos e tipos), `src/hooks/useNotificationSound.ts` (ganho até 2x + repetição), `src/hooks/useAdminServiceCalls.ts` (expor pendentes para o loop de repetição), `src/pages/admin/AdminSettings.tsx` (UI de som, repetição e volume), `src/components/ui/product-card.tsx` e `src/pages/MenuPage.tsx` (quebra de linha).
