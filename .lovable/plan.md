
## Corrigir: Grupos privados nao aparecem em "Meus Grupos"

### Problema
A view `groups_public` possui o filtro `WHERE g.is_private = false`, que exclui todos os grupos privados. Quando o usuario filtra por "Meus Grupos", a query usa essa mesma view, entao seus grupos privados nunca aparecem.

### Solucao
Criar uma nova view `groups_my` que inclui grupos privados, mas somente para membros ou lideres autenticados. A view `groups_public` continuara filtrando apenas grupos publicos (comportamento correto para a aba "Todos").

### Alteracoes

**1. Criar view `groups_my` no banco de dados**
- Uma nova view com `security_invoker = on` que mostra todos os grupos (publicos e privados) sem o filtro `is_private = false`
- A seguranca sera garantida pelo RLS da tabela `groups` (que ja permite acesso a grupos privados para lideres e membros)

**2. Atualizar `src/hooks/usePaginatedGroups.tsx`**
- No bloco do filtro `"mine"`, trocar a query de `groups_public` para `groups_my`
- Isso fara com que grupos privados do usuario aparecam na aba "Meus Grupos"
- A aba "Todos" continuara usando `groups_public` (somente publicos)

### Por que isso e seguro
- A view `groups_my` usa `security_invoker = on`, ou seja, as politicas de RLS da tabela `groups` se aplicam
- O RLS da tabela `groups` ja permite SELECT apenas para: grupos publicos, grupos onde o usuario e lider, grupos onde o usuario e membro, ou administradores
- Nenhum usuario vera grupos privados de terceiros
