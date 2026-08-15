# Sons de notificação, tempo real e nomes no cardápio

## 1. Três sons de notificação com volume

Em **Configurações → Notificações** (`AdminSettings.tsx`):
- Manter o switch "Som ativado" e adicionar:
  - Seletor de som: **Sino** (beep duplo atual), **Campainha** (três toques curtos) e **Alerta** (sirene ascendente) — todos gerados via Web Audio, sem arquivos externos.
  - Slider de **volume** (0–100%).
  - Botão "Testar som" toca a combinação escolhida (som + volume).
- Os valores são salvos no JSON `notification_settings` do estabelecimento: `sound_enabled`, `sound_type`, `sound_volume`. Nenhuma migração de banco é necessária (campo já é JSONB).
- `useNotificationSound` passa a ler o tipo e o volume do tenant atual e a tocar o padrão correspondente.

Detalhe técnico: `useNotificationSound` hoje chama `useAdminSettings()` sem ID, o que cai no primeiro estabelecimento ativo — será trocado por `useTenantSettings()` para respeitar o estabelecimento logado.

## 2. Chamados de atendimento em tempo real

Situação atual: `service_calls` já está na publicação `supabase_realtime` e os hooks assinam INSERT/UPDATE, mas sem nenhuma rede de segurança quando o socket cai ou a aba fica em segundo plano — é a causa mais provável da demora percebida. Ajustes em `useAdminServiceCalls.ts`:
- Adicionar `refetchInterval` de 10s (com `refetchIntervalInBackground`) e `refetchOnWindowFocus` como fallback de polling.
- Assinar também `DELETE` e usar um único handler `event: '*'`, invalidando as duas queries (`admin-service-calls` e `pending-service-calls`) em qualquer mudança — hoje cada hook invalida só a própria.
- Refazer o `fetch` ao reconectar o canal (callback de status `SUBSCRIBED`), para não perder eventos ocorridos durante a queda.
- Estabilizar `playNotificationSound` para o efeito de assinatura não recriar o canal a cada render.
- Tocar o som também quando o chamado chega via refetch (comparando IDs novos), garantindo aviso mesmo sem evento realtime.

## 3. Nomes dos produtos no cardápio

Em `src/components/ui/product-card.tsx`:
- Remover o `line-clamp-1` do título (fim dos "..."), permitindo quebra de linha por palavra (`break-words`, sem `truncate`).
- Reduzir levemente a fonte do nome (de `text-xl` para `text-lg`, `text-base` no mobile) mantendo o estilo editorial.
- Garantir que a coluna de badges/preço continue alinhada ao topo com o nome em duas ou três linhas.
