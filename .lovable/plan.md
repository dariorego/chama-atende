
## Objetivo
Adicionar um cabeçalho visual no topo da página do cardápio (`/:slug`) com:
- **Imagem horizontal de capa** (banner) ocupando toda a largura.
- **Logo circular sobreposto** e centralizado sobre a capa.

E permitir que o admin faça upload das duas imagens com sugestão de tamanho e recorte na própria ferramenta.

---

## 1. Banco de dados
Adicionar coluna nova em `restaurants`:
- `cover_url text null` — URL da capa horizontal.
- O `logo_url` já existe e será reaproveitado.

Migration simples com `ALTER TABLE public.restaurants ADD COLUMN cover_url text`.

---

## 2. Componente de recorte de imagem
Criar `src/components/ui/image-crop-dialog.tsx` usando **`react-easy-crop`** (adicionar dep):
- Recebe: arquivo selecionado, `aspect` (número), `title`, `recommendedSize` (texto de dica).
- Mostra preview com zoom/pan, controle de zoom (slider).
- Ao confirmar: gera um `Blob` recortado (canvas) e devolve via callback.
- Botão “Cancelar / Aplicar recorte”.

Ratios usados:
- Capa: `16/6` (banner) — sugestão exibida: **1600×600px**.
- Logo: `1/1` — sugestão exibida: **512×512px** (será exibido como círculo).

---

## 3. Admin — Configurações (`AdminSettings.tsx`)
Na seção “Informações do restaurante”:
- Manter o campo atual de **Logo** e passar a abri-lo pelo `ImageCropDialog` (1:1) antes de subir via `useImageUpload`.
- Adicionar novo campo **Imagem de capa** logo abaixo, com:
  - Preview horizontal (proporção 16:6).
  - Botão “Enviar imagem” → abre `ImageCropDialog` (16:6).
  - Botão “Remover”.
  - Texto auxiliar: “Recomendado: 1600×600px — JPG ou PNG”.
- Salvar `cover_url` no update do restaurante (junto de `logo_url`).

Nenhuma outra área do admin muda.

---

## 4. Página do cardápio (`MenuPage.tsx` + `ClientLayout.tsx`)
Renderizar um novo bloco **Hero** no topo do conteúdo do menu, antes da busca:
- Container `relative` largura total (usar `-mx-4` para escapar do padding do `ClientLayout` e manter o resto igual).
- `<img src={restaurant.cover_url}>` em `aspect-[16/6] w-full object-cover`. Fallback: gradiente sutil `bg-emerald-deep/10` quando não houver capa.
- Sobre a capa, `absolute` centralizado horizontalmente e deslocado para baixo (`-bottom-12`): logo circular `w-24 h-24 rounded-full border-4 border-cream object-cover shadow-lg`. Fallback: ícone `ChefHat` dentro do círculo.
- Abaixo do hero, spacing `mt-16` para acomodar a metade do logo que sobra.
- Nome do restaurante centralizado abaixo do logo (usa `restaurant.name`).
- Ocultar o `title` atual “Cardápio” do `ClientLayout` nesta página (passar `title={undefined}`), já que o hero passa a ser a identidade visual.

Buscar `restaurant` via hook já existente (usar `useTenant` ou um `useRestaurantPublic` similar aos hooks públicos — reaproveitar o que já traz `logo_url`/`name` do restaurante no cardápio; se não existir, adicionar select mínimo pelo `publicApi` / `useTenant`).

---

## 5. Detalhes técnicos
- Dependência nova: `react-easy-crop`.
- Upload continua via `useImageUpload` para o bucket `imagens` em pastas `logos/` e `capas/`.
- Ao trocar uma imagem existente, tentar deletar a antiga (best-effort com `deleteImage`).
- Validar tipo (`image/*`) e tamanho máx (~5 MB) antes de abrir o cropper.
- Sem mudanças em RLS/edge functions — `cover_url` é público como o `logo_url`.

---

## Arquivos afetados
- `supabase/migrations/<novo>.sql` (add `cover_url`)
- `src/integrations/supabase/types.ts` (regenerado pela migration)
- `src/components/ui/image-crop-dialog.tsx` (novo)
- `src/pages/admin/AdminSettings.tsx` (novo campo de capa + crop no logo)
- `src/pages/MenuPage.tsx` (bloco hero)
- `src/components/layout/ClientLayout.tsx` (permitir remover o header padrão quando hero estiver ativo — já suporta via `title` opcional)
- `package.json` (dep `react-easy-crop`)
