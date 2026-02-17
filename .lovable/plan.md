

## Adicionar flag `is_test` na tabela `groups` e ordenar grupos de teste por ultimo

### Problema
Nao existe uma forma de marcar grupos como "teste" no banco de dados. Grupos de teste aparecem misturados com os reais na listagem.

### Solucao

**1. Banco de dados (migration SQL)**

- Adicionar coluna `is_test` (boolean, default false) na tabela `groups`
- Recriar as 3 views (`groups_public`, `groups_my`, `groups_admin`) incluindo a nova coluna `is_test`
- A view `groups_public` vai manter `is_test` visivel para que o frontend possa ordenar

**2. Frontend - Ordenacao**

- No hook `usePaginatedGroups.tsx`, alterar a ordenacao para usar `is_test` primeiro (ascendente, false antes de true) e depois `created_at` (descendente)
- Isso garante que grupos de teste sempre aparecem por ultimo, tanto na aba "Todos" quanto na aba "Meus Grupos"

**3. Interface do grupo (visual)**

- Adicionar indicador visual "Teste" nos cards de grupo marcados como `is_test`, similar ao que ja existe para parceiros

### Detalhes tecnicos

**Migration SQL:**
```sql
ALTER TABLE groups ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- Recriar views com is_test
DROP VIEW IF EXISTS groups_public CASCADE;
CREATE VIEW groups_public WITH (security_invoker = off) AS
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
WHERE g.is_private = false;

-- Mesmo para groups_my e groups_admin (incluindo is_test)
```

**Frontend (usePaginatedGroups.tsx):**
- Ordenar por `is_test` ascendente primeiro, depois `created_at` descendente
- Mapear `is_test` no objeto Group retornado

**Arquivos alterados:**
- 1 migration SQL (nova coluna + views atualizadas)
- `src/hooks/usePaginatedGroups.tsx` - ordenacao e mapeamento
- `src/hooks/useGroups.tsx` - ordenacao
- `src/components/GroupsSection.tsx` - badge visual de teste (opcional)
