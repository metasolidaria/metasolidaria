
# Plano: Corrigir Exibição de Grupos Privados na Aba "Todos"

## Diagnóstico do Problema

A aba "Todos os Grupos" está mostrando grupos privados dos quais o usuário não é líder nem membro. Isso acontece porque:

1. A view `groups_public` foi criada com `security_invoker=false` (padrão)
2. Sem `security_invoker`, a view ignora as políticas RLS da tabela `groups`
3. Resultado: todos os grupos (incluindo privados) são retornados para qualquer usuário autenticado

### Dados do Banco
- Grupos públicos: 1
- Grupos privados: 5
- A RLS da tabela `groups` filtra corretamente por: `is_private = false` OU `leader_id = user` OU `is_group_member()`

---

## Solução Proposta

### Opção 1: Recriar a View com `security_invoker=on` (Recomendado)

Recriar a view `groups_public` com a opção `security_invoker=on`, fazendo com que ela herde automaticamente as políticas RLS da tabela `groups`.

```sql
DROP VIEW IF EXISTS groups_public;

CREATE VIEW groups_public
WITH (security_invoker=on) AS
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
    g.end_date,
    g.created_at,
    g.updated_at,
    g.image_url,
    g.members_visible,
    g.view_count,
    g.default_commitment_name,
    g.default_commitment_metric,
    g.default_commitment_ratio,
    g.default_commitment_donation,
    g.default_commitment_goal,
    COALESCE(gs.member_count, 0) AS member_count,
    COALESCE(gs.total_goals, 0) AS total_goals,
    COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id;

-- Conceder permissões à view
GRANT SELECT ON groups_public TO anon, authenticated;
```

### Benefícios
- A view passa a respeitar as políticas RLS existentes na tabela `groups`
- Grupos privados só aparecem para líderes e membros
- Não precisa alterar código frontend

### Validação do Comportamento Esperado

Após a correção:

| Usuário | Grupo Público | Grupo Privado (não membro) | Grupo Privado (membro/líder) |
|---------|---------------|----------------------------|------------------------------|
| Logado  | Vê            | Não vê                     | Vê                          |
| Anon    | Não vê*       | Não vê                     | N/A                         |

*A RLS atual exige `auth.uid() IS NOT NULL`, então usuários anônimos não veem nenhum grupo.

---

## Detalhes Técnicos

### Por que isso aconteceu?

Por padrão, views no PostgreSQL executam com as permissões do **criador** da view (SECURITY DEFINER implícito), não do usuário que está fazendo a consulta. Isso significa que as políticas RLS são verificadas para o owner da view, não para o usuário final.

Com `security_invoker=on`, a view passa a executar com as permissões do **usuário que está consultando**, fazendo com que as políticas RLS sejam aplicadas corretamente.

### Impacto

- A mudança afeta apenas a visibilidade dos grupos na listagem
- Não há impacto em outras funcionalidades (criar grupo, entrar em grupo, etc.)
- Os dados de membros/metas/doações continuarão sendo agregados corretamente

---

## Passos de Implementação

1. Criar migração SQL para recriar a view com `security_invoker=on`
2. Verificar que a view `groups_admin` (usada pelos admins) continua funcionando
3. Testar a listagem de grupos como usuário comum
