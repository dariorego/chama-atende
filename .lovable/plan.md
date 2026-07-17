# Fase 2 — Componentes compartilhados no padrão Emerald Prestige

## Objetivo
Propagar automaticamente a linguagem editorial (creme + verde profundo + dourado + Instrument Serif) para todas as telas do cliente ajustando os 3 componentes reutilizáveis que aparecem no Hub, Cardápio, Encomendas e demais fluxos.

## Componentes a ajustar

### 1. `src/components/ui/action-card.tsx`
Cards de módulo usados no Hub (Cardápio, Reserva, Fila, Garçom, Avaliação, Encomenda).

- Fundo creme suave (`bg-cream-soft`) com borda fina verde profundo
- Título em Instrument Serif verde profundo (não mais bold sans branco)
- Descrição em Work Sans cinza-esverdeado
- Ícone dentro de um círculo com borda dourada
- Variante `hero` (Cardápio em destaque): fundo verde profundo, texto creme, badge "DESTAQUE" em dourado, botão "Ver Cardápio" dourado
- Variantes coloridas (`amber`, `purple`, `blue`, `rose`, `primary`) unificadas em duas: **default** (creme com borda) e **hero** (verde profundo). Cores individuais viram apenas um pequeno filete dourado no ícone para diferenciação sutil.
- Estado `disabled`: opacidade reduzida, cursor bloqueado, sem hover

### 2. `src/components/ui/product-card.tsx`
Card de produto do Cardápio e Encomendas.

- Fundo `bg-cream-soft` com borda verde profundo/10
- Imagem à esquerda com cantos arredondados
- Nome do prato em Instrument Serif verde profundo
- Descrição em Work Sans, cor `text-emerald-deep/60`
- Preço em Instrument Serif dourado, maior
- Badge de promoção: fundo dourado, texto verde profundo, tracking wide
- Hover: leve elevação e borda passa a dourada

### 3. `src/components/ui/product-detail-sheet.tsx`
Sheet lateral/inferior de detalhes do produto.

- Fundo creme, header com título serif verde profundo
- Preço em serif dourado
- Botão "Adicionar" em verde profundo com texto creme e detalhe dourado
- Controles de quantidade (+/-) com borda dourada
- Chips de combinações no mesmo estilo dos chips de horário da reserva

## Verificação
- Screenshot mobile do `/bistro-verde` (Hub) confirmando cards editoriais
- Screenshot mobile do `/bistro-verde/cardapio` confirmando ProductCards editoriais e destaque do Chef
- Screenshot da sheet de detalhe (clicando em um produto)

## Não incluído nesta fase
- Páginas de Encomendas, Fila, Garçom, Avaliação, Pedido (ficam para Fases 3-5)
- Painel administrativo
- Layouts split-screen específicos por página

## Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `src/components/ui/action-card.tsx` | Reescrever variantes |
| `src/components/ui/product-card.tsx` | Reescrever estilos |
| `src/components/ui/product-detail-sheet.tsx` | Ajustar estilos e tipografia |
