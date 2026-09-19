# Corrigir saída da fila

## Objetivo
Permitir que clientes cancelem sua própria entrada, inclusive entradas criadas antes da separação por estabelecimento.

## Alterações
- Recuperar com segurança o telefone salvo pela versão anterior da fila.
- No cancelamento, validar o identificador da entrada e o telefone completo antes de alterar o status.
- Aceitar a compatibilidade apenas para entradas antigas sem estabelecimento; novas entradas continuam isoladas pelo estabelecimento atual.
- Validar o cancelamento e a compilação.

## Detalhes técnicos
- Migrar as chaves antigas da fila no celular para as chaves por estabelecimento.
- Adicionar fallback restrito no `public-api` para registros legados com `restaurant_id` vazio, sem aceitar identificador de proprietário enviado pelo cliente.
