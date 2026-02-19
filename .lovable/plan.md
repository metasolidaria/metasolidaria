

## Ocultar grupos de teste da listagem de Grupos Ativos

### O que muda

Grupos marcados como `is_test = true` deixarao de aparecer na listagem publica de "Grupos Ativos" e tambem na aba "Meus Grupos". Eles continuarao visiveis apenas no painel administrativo (`groups_admin`).

### Abordagem

Adicionar o filtro `WHERE is_test = false` (ou `COALESCE(is_test, false) = false`) nas views `groups_public` e `groups_my` do banco de dados. Isso resolve o problema na raiz, sem necessidade de alterar codigo frontend.

### Arquivo afetado

**Migracao SQL** - Recriar as duas views adicionando o filtro:

1. `groups_public`: atualmente filtra apenas `is_private = false`. Adicionar `AND (g.is_test = false)`.
2. `groups_my`: atualmente nao tem filtro WHERE. Adicionar `WHERE (g.is_test = false)`.

A view `groups_admin` **nao sera alterada**, garantindo que administradores continuem vendo grupos de teste.

### Detalhes tecnicos

```sql
-- Recriar groups_public com filtro de teste
CREATE OR REPLACE VIEW groups_public AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
       g.is_private, g.leader_id, g.leader_name, g.description,
       g.image_url, g.end_date, g.entity_id, g.members_visible,
       g.view_count, g.is_test,
       g.default_commitment_name, g.default_commitment_metric,
       g.default_commitment_ratio, g.default_commitment_donation,
       g.default_commitment_goal,
       g.created_at, g.updated_at,
       COALESCE(gs.member_count, 0) AS member_count,
       COALESCE(gs.total_goals, 0) AS total_goals,
       COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false
  AND g.is_test = false;  -- NOVO FILTRO

-- Recriar groups_my com filtro de teste
CREATE OR REPLACE VIEW groups_my AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
       g.is_private, g.leader_id, g.leader_name, g.description,
       g.entity_id, g.end_date, g.created_at, g.updated_at,
       g.image_url, g.members_visible, g.view_count, g.is_test,
       g.default_commitment_name, g.default_commitment_metric,
       g.default_commitment_ratio, g.default_commitment_donation,
       g.default_commitment_goal,
       COALESCE(gs.member_count, 0) AS member_count,
       COALESCE(gs.total_goals, 0) AS total_goals,
       COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_test = false;  -- NOVO FILTRO
```

### Impacto

- **Listagem publica ("Todos")**: grupos de teste nao aparecem mais
- **Aba "Meus Grupos"**: grupos de teste nao aparecem mais
- **Contador "Meus Grupos"**: sera atualizado automaticamente (usa `groups_public`)
- **Painel admin**: sem alteracao, continua mostrando tudo
- **Busca de grupos** (`groups_search`): verificar se tambem precisa do filtro (provavelmente sim)
- **Nenhuma alteracao de codigo frontend necessaria**

