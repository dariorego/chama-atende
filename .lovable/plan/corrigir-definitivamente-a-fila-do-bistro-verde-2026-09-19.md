# Corrigir definitivamente a fila do Bistro Verde

## Diagnóstico confirmado
- O pedido do telefone informado existe e está com status **aguardando**, mas foi salvo sem estabelecimento.
- O painel está correto ao listar somente registros vinculados ao Bistro Verde; por isso a entrada não aparece.
- A aplicação usa o Supabase self-hosted, enquanto a publicação automática das funções está apontando para o projeto Cloud antigo. Isso mantém uma versão antiga do servidor ativa no endereço usado pelos clientes.

## Implementação
1. **Unificar o ambiente ativo**
   - Publicar a função `public-api` no Supabase self-hosted usado pela aplicação.
   - Confirmar que URL, chave pública e credenciais internas da função pertencem ao mesmo banco.

2. **Criar a entrada da fila somente no servidor**
   - Trocar a gravação direta do navegador pela ação `create-queue-entry`.
   - Validar estabelecimento ativo, nome, telefone e quantidade de pessoas.
   - Gerar código, posição e estimativa no servidor para evitar registros duplicados ou sem vínculo.
   - Retornar sucesso ao celular somente depois de confirmar que `restaurant_id` foi gravado.

3. **Corrigir os registros existentes**
   - Vincular ao Bistro Verde o pedido confirmado do telefone `81998073496`.
   - Revisar outros registros sem estabelecimento antes de vinculá-los, sem misturar dados entre empresas.
   - Depois da correção dos dados, impedir definitivamente novas entradas sem estabelecimento.

4. **Manter o painel isolado e atualizado**
   - Continuar filtrando a fila por `restaurant_id` e pelo dia local do estabelecimento.
   - Preservar a atualização automática e a regra de acesso do administrador daquele estabelecimento.
   - Exibir erro claro no celular se a entrada não puder ser gravada, em vez de mostrar uma confirmação falsa.

## Validação
- Fazer uma nova entrada pública no Bistro Verde com um telefone de teste.
- Confirmar no banco que ela foi salva com o ID do Bistro Verde e status `waiting`.
- Confirmar que aparece no painel em até 10 segundos.
- Chamar, acomodar e cancelar entradas pelo painel.
- Confirmar que a fila de outro slug não exibe esses dados.
- Validar separadamente a entrada antiga corrigida e uma entrada nova.

## Dependência operacional
A publicação da função e a correção dos dados precisam ser executadas no Supabase self-hosted `supabase.chamaatende.com.br`; aplicar somente no projeto Cloud não altera a aplicação atual.
