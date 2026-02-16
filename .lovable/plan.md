

## Ocultar instituicoes de teste da tela inicial

As 5 instituicoes de teste (Lar dos Idosos Esperanca, Casa da Crianca Feliz, etc.) estao aparecendo porque nao existe nenhum mecanismo para diferencia-las das reais.

### O que sera feito

**1. Adicionar coluna `is_test` na tabela `entities`**
- Nova coluna booleana com default `false`
- Marcar as 5 instituicoes de seed como `is_test = true`

**2. Atualizar a view `entities_public`**
- Adicionar filtro `WHERE is_test = false` para ocultar instituicoes de teste da listagem publica

**3. Nenhuma alteracao de codigo necessaria**
- O hook `useEntities` e o `EntitiesSection` ja usam a view `entities_public`, entao o filtro sera aplicado automaticamente

### Detalhes tecnicos

Uma unica migracao SQL que:
1. Adiciona `is_test boolean NOT NULL DEFAULT false` na tabela `entities`
2. Atualiza as 5 entidades de teste (`e1111111-...` ate `e5555555-...`) para `is_test = true`
3. Recria a view `entities_public` com `WHERE is_test = false`

As instituicoes de teste continuarao no banco e visiveis na aba de administracao, mas nao aparecerao mais na tela inicial nem nas sugestoes de entidades na pagina do grupo.
