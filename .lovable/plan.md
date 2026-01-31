
# Plano: Corrigir Indicadores Zerados nos Cards de Grupos

## Problema Identificado

Os indicadores dos cards de grupos (membros, metas, doações) estão zerados para grupos novos porque:

1. A view `groups_public` faz JOIN com a view materializada `group_stats`
2. **Views materializadas não atualizam automaticamente** - elas armazenam dados em cache
3. Quando um grupo é criado, ele não existe em `group_stats` até que um `REFRESH` seja executado
4. Resultado: `member_count`, `total_goals` e `total_donations` retornam `0`

### Evidência do Problema

```text
┌─────────────────────┬─────────────────────────────────────────────────┐
│ Tabela              │ Situação                                        │
├─────────────────────┼─────────────────────────────────────────────────┤
│ groups              │ ✅ Contém os 2 grupos novos                     │
│ group_members       │ ✅ Contém o líder como membro                   │
│ member_commitments  │ ✅ Contém a meta do líder                       │
│ group_stats (MV)    │ ❌ NÃO contém os grupos novos                   │
│ groups_public       │ ❌ Retorna zeros (depende de group_stats)       │
└─────────────────────┴─────────────────────────────────────────────────┘
```

---

## Solução Proposta

**Converter `group_stats` de MATERIALIZED VIEW para VIEW regular**

Esta é a melhor abordagem porque:
- Dados sempre atualizados em tempo real
- Sem necessidade de triggers ou jobs de refresh
- Simplicidade de manutenção
- Volume de dados ainda é pequeno (não impacta performance significativamente)

---

## Etapas de Implementação

### Etapa 1: Migração do Banco de Dados

Executar SQL para:
1. Remover a view `groups_public` (depende de `group_stats`)
2. Remover a view materializada `group_stats`
3. Recriar `group_stats` como **VIEW regular**
4. Recriar `groups_public` com a mesma definição
5. Conceder permissões de leitura

```text
-- 1. Remover views dependentes
DROP VIEW IF EXISTS groups_public CASCADE;
DROP VIEW IF EXISTS groups_admin CASCADE;

-- 2. Remover a materialized view
DROP MATERIALIZED VIEW IF EXISTS group_stats CASCADE;

-- 3. Recriar como VIEW regular
CREATE VIEW group_stats AS
SELECT 
  g.id AS group_id,
  COUNT(gm.id) AS member_count,
  COALESCE(SUM(mc.personal_goal), 0) AS total_goals,
  COALESCE((
    SELECT SUM(gp.amount) 
    FROM goal_progress gp 
    WHERE gp.group_id = g.id
  ), 0) AS total_donations
FROM groups g
LEFT JOIN group_members gm ON gm.group_id = g.id
LEFT JOIN member_commitments mc ON mc.member_id = gm.id
GROUP BY g.id;

-- 4. Conceder permissões
GRANT SELECT ON group_stats TO anon, authenticated;

-- 5. Recriar groups_public (mesma definição anterior)
CREATE VIEW groups_public WITH (security_invoker=on) AS
SELECT 
  g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.description,
  g.entity_id, g.end_date, g.created_at, g.updated_at,
  g.image_url, g.members_visible, g.view_count,
  g.default_commitment_name, g.default_commitment_metric,
  g.default_commitment_ratio, g.default_commitment_donation,
  g.default_commitment_goal,
  COALESCE(gs.member_count, 0) AS member_count,
  COALESCE(gs.total_goals, 0) AS total_goals,
  COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id;

-- 6. Recriar groups_admin
CREATE VIEW groups_admin WITH (security_invoker=on) AS
SELECT 
  g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.leader_whatsapp,
  u.email as leader_email, g.description, g.entity_id, 
  g.image_url, g.end_date, g.created_at, g.updated_at,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals,
  g.view_count, g.members_visible
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
LEFT JOIN auth.users u ON u.id = g.leader_id;
```

### Etapa 2: Remover Função de Refresh (Opcional)

Se existir, remover a função `refresh_group_stats()` que não será mais necessária.

---

## Arquivos Afetados

Apenas migração SQL - não há alterações no código frontend.

| Arquivo | Mudança |
|---------|---------|
| `supabase/migrations/` | Nova migração para recriar views |

---

## Resultado Esperado

Após a migração:
- Grupos novos aparecerão imediatamente com os indicadores corretos
- `member_count` mostrará o líder (1 membro)
- `total_goals` mostrará a soma das metas dos commitments
- `total_donations` mostrará 0 (nenhuma doação ainda)

---

## Considerações de Performance

Para o volume atual de dados (~5-10 grupos), uma VIEW regular não terá impacto perceptível. Se no futuro houver milhares de grupos, podemos:
1. Adicionar índices otimizados
2. Implementar cache no frontend
3. Voltar para MATERIALIZED VIEW com triggers de refresh

---

## Alternativa Considerada (Descartada)

**Trigger para REFRESH automático**:
- Mais complexo de manter
- Pode causar lentidão em operações de INSERT/UPDATE
- Risco de deadlocks em alta concorrência
- Não resolve o problema imediatamente (refresh acontece após o INSERT)
