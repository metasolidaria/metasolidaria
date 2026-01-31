
# Plano: Corrigir Cards de "Meus Grupos" Não Aparecendo

## Problema Identificado

A view `groups_public` tem uma cláusula `WHERE g.is_private = false` que exclui todos os grupos privados. Como **todos os grupos no sistema são privados** (`is_private = true`), a view sempre retorna vazio.

Quando você vai em "Meus Grupos", o contador mostra "1" (pois o hook `useUserMemberships` consulta diretamente a tabela `group_members`), mas o card não aparece porque a query de grupos usa a view `groups_public` que filtra grupos privados.

## Solução Proposta

Atualizar a view `groups_public` para incluir grupos privados **apenas quando o usuário autenticado é membro ou líder** do grupo. Isso mantém a segurança (não expõe grupos privados para não-membros) mas permite que membros vejam seus próprios grupos.

## Detalhes Técnicos

### 1. Atualizar a View `groups_public`

Modificar a definição da view para usar a função `is_group_member()` já existente:

```sql
CREATE OR REPLACE VIEW groups_public
WITH (security_invoker = on) AS
SELECT 
    g.id,
    g.name,
    g.city,
    g.donation_type,
    g.goal_2026,
    g.is_private,
    g.leader_id,
    g.leader_name,
    g.description,
    g.entity_id,
    g.image_url,
    g.end_date,
    g.created_at,
    g.updated_at,
    COALESCE(gs.member_count, 0::bigint) AS member_count,
    COALESCE(gs.total_donations, 0::bigint) AS total_donations,
    COALESCE(gs.total_goals, 0::bigint) AS total_goals,
    g.view_count,
    g.members_visible
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE 
    g.is_private = false  -- Grupos públicos visíveis para todos
    OR g.leader_id = auth.uid()  -- Líder pode ver seu grupo privado
    OR is_group_member(auth.uid(), g.id);  -- Membros podem ver o grupo
```

### 2. Permissões de Acesso

A view já usa `security_invoker = on`, então as policies RLS da tabela base `groups` são respeitadas. A tabela `groups` já tem a policy:

```sql
"Authenticated users can view accessible groups"
WHERE (auth.uid() IS NOT NULL) AND (
    is_private = false 
    OR leader_id = auth.uid() 
    OR is_group_member(auth.uid(), id)
)
```

Isso garante que a lógica esteja consistente.

## Arquivos Alterados

Nenhum arquivo de código precisa ser alterado - apenas uma migração SQL para atualizar a view.

## Resultado Esperado

- O contador "Meus Grupos (1)" continuará correto
- O card do grupo privado aparecerá para os membros
- Grupos privados continuam invisíveis para não-membros
- A listagem "Todos" mostra apenas grupos públicos para usuários não autenticados
