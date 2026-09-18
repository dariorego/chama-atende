# Corrigir fila por estabelecimento

## Objetivo
Garantir que toda entrada na fila seja vinculada ao estabelecimento atual e apareça imediatamente no painel administrativo correspondente.

## Alterações
- Enviar o identificador do Bistro Verde ao criar uma entrada pública na fila.
- Filtrar painel, códigos, posições, estimativas e consultas pelo estabelecimento atual.
- Separar no celular os dados de fila por estabelecimento, evitando misturar filas de slugs diferentes.
- Reforçar a validação para impedir novas entradas sem estabelecimento.
- Validar o fluxo completo de entrada e visualização no painel.

## Detalhes técnicos
- Ajustar os hooks público e administrativo da fila para usar `restaurant_id`.
- Ajustar as ações de fila da função pública para exigir e aplicar `restaurantId`.
- Atualizar a política de inserção da fila sem abrir acesso entre estabelecimentos.
