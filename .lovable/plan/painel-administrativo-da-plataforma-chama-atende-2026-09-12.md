# Painel administrativo da plataforma Chama-Atende

## Objetivo
Criar a área exclusiva `/adminchamaatende` para administrar estabelecimentos, licenças, planos e módulos, sem depender do acesso administrativo de um estabelecimento específico.

## Experiência do painel
- Criar uma entrada própria com autenticação e bloqueio para qualquer usuário que não esteja na lista de administradores da plataforma.
- Criar um painel com indicadores de estabelecimentos ativos, licenças ativas, próximas do vencimento, vencidas e suspensas.
- Listar estabelecimentos com busca e filtros por plano, situação da licença e vencimento.
- Exibir em cada estabelecimento: nome, slug, plano, situação, vencimento e resumo dos módulos ativos.
- Abrir os detalhes do estabelecimento para alterar plano, datas da licença, situação e módulos liberados.
- Permitir renovar, suspender e reativar uma licença com confirmação antes da alteração.
- Usar o padrão visual atual do administrativo, com navegação própria da plataforma e suporte aos temas claro e escuro.

## Planos e módulos
- Manter os planos Starter, Profissional e Enterprise como modelos iniciais de módulos.
- Ao selecionar um plano, preencher sua seleção padrão de módulos.
- Permitir exceções por estabelecimento, ativando ou desativando módulos individualmente antes de salvar.
- Mostrar claramente quais módulos vêm do plano e quais foram personalizados.
- Manter compatibilidade com o campo de plano e os módulos já usados pelas telas atuais.

## Dados e segurança
- Criar uma tabela exclusiva de administradores da plataforma, separada de perfis e das funções por estabelecimento.
- Criar uma estrutura de licenças vinculada ao estabelecimento, contendo plano, situação, início, vencimento e datas de atualização.
- Aplicar permissões no banco para que somente administradores da plataforma consultem ou alterem todas as licenças, estabelecimentos e módulos.
- Adicionar funções seguras para validar o acesso global sem confiar no navegador.
- Preservar o isolamento atual entre estabelecimentos e não ampliar as permissões dos administradores locais.
- Sincronizar alterações de plano e módulos de forma atômica, evitando uma licença parcialmente atualizada.

## Regras de licença
- Situações: ativa, próxima do vencimento, vencida e suspensa.
- “Próxima do vencimento” será calculada para licenças com até 7 dias restantes.
- Licença vencida ou suspensa bloqueará o painel do estabelecimento; a tela informará o motivo sem expor dados de outro estabelecimento.
- A renovação atualizará o vencimento e reativará a licença, mantendo o histórico mínimo de alterações.

## Implementação técnica
- Criar uma rota e um layout globais fora do contexto de slug do estabelecimento.
- Criar proteção específica para `/adminchamaatende`, consultando a nova permissão global no Supabase.
- Criar consultas e alterações próprias para estabelecimentos, licenças e módulos, com atualização das listas após cada ação.
- Reaproveitar o catálogo atual de módulos e os componentes visuais existentes, extraindo a seleção de módulos para uso no novo painel.
- Integrar a validação de licença à proteção das rotas administrativas por estabelecimento.

## Validação
- Testar acesso autorizado e bloqueio de usuário comum.
- Testar busca, filtros, seleção de plano, exceções de módulos, renovação, suspensão e reativação.
- Confirmar que um administrador local não consegue acessar `/adminchamaatende` nem alterar outro estabelecimento.
- Confirmar que as alterações aparecem no painel do estabelecimento correto e que licenças vencidas/suspensas são bloqueadas.
- Validar as telas em computador e celular, além do estado claro e escuro.
