# Nome do cliente no diálogo "Qual é sua mesa?"

Hoje, ao chamar o atendente pelo cardápio (botão flutuante), o diálogo pede apenas a mesa e, só depois, abre um segundo diálogo pedindo o nome. A ideia é juntar tudo em uma única tela, com o nome opcional e memorizado no celular — igual ao comportamento já existente no acesso por QR Code.

## Como fica para o cliente

1. O diálogo "Qual é sua mesa?" passa a ter dois campos: seleção da mesa (obrigatório) e "Seu nome (opcional)".
2. O campo de nome já vem preenchido com o nome salvo no celular, quando existir.
3. Ao tocar em "Chamar Atendente", o nome informado é salvo no aparelho (por estabelecimento) e enviado junto com o chamado. Se ficar vazio, o chamado segue apenas com a mesa.
4. Quando o cliente já tem mesa definida (veio do QR Code) e o nome salvo, o chamado continua sendo enviado direto, sem diálogo.
5. Quando já tem mesa mas ainda não tem nome, continua aparecendo o diálogo curto de nome atual (opcional, com "Continuar sem nome").

## Detalhes técnicos

- `src/pages/MenuPage.tsx`: adicionar estado local do nome no diálogo de mesa, inicializado com `customerName` de `useCustomerName`; em `handleTableSelectAndCall`, chamar `saveName(nameInput)` e passar o resultado para `sendWaiterCall`, evitando abrir o `CustomerNameDialog` nesse fluxo.
- Reaproveitar `Input` com os tokens do design system (`bg-surface`, `placeholder:text-surface-foreground`, `border-border`, `focus:ring-primary`) e `maxLength={MAX_CUSTOMER_NAME}`.
- Persistência e sanitização continuam em `useCustomerName` (localStorage por slug); nenhuma mudança de banco ou RLS — `customer_name` já existe em `service_calls`.
- `CustomerNameDialog` permanece para o caminho em que a mesa já está definida.
