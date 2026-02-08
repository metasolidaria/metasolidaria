

## Plano: Adicionar Acesso de Admin às Políticas RLS

### Diagnóstico Confirmado

O membro aparece porque corrigimos a view `group_members_public`. Porém, as **metas (commitments)** não aparecem porque a política RLS de SELECT da tabela `member_commitments` não inclui verificação de administrador.

### Dados do Grupo "Manas Fit"

| Dado | Valor |
|------|-------|
| ID do Grupo | `fc477eae-bd9a-4f59-a726-c254a2873b84` |
| Membro | Cristina Buzzanca (ID: `fd3759dd...`) |
| Commitment | "3 Cardio por semana" com `personal_goal = 24` |
| Privado | Sim |

### Causa Raiz

A política RLS de `member_commitments` para SELECT:

```sql
-- Política ATUAL (sem admin)
WHERE (g.is_private = false) 
   OR (g.leader_id = auth.uid()) 
   OR is_group_member(auth.uid(), g.id)
-- Falta: OR is_admin(auth.uid())
```

Como você é **admin mas não é membro/líder** do grupo "Manas Fit", a política bloqueia o acesso aos commitments.

### Solução

Atualizar as políticas RLS para incluir administradores:

1. **member_commitments** - Adicionar `is_admin()` na política de SELECT
2. **goal_progress** - Adicionar `is_admin()` na política de SELECT (para consistência)

### Migração SQL

```sql
-- 1. Atualizar política de member_commitments
DROP POLICY IF EXISTS "Users can view commitments for accessible groups" ON member_commitments;

CREATE POLICY "Users can view commitments for accessible groups" 
ON member_commitments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.id = member_commitments.member_id
    AND (
      g.is_private = false 
      OR g.leader_id = auth.uid() 
      OR is_group_member(auth.uid(), g.id)
      OR is_admin(auth.uid())  -- NOVO
    )
  )
);

-- 2. Atualizar política de goal_progress
DROP POLICY IF EXISTS "Authenticated users can view progress for accessible groups" ON goal_progress;

CREATE POLICY "Authenticated users can view progress for accessible groups"
ON goal_progress FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = goal_progress.group_id
      AND (
        groups.is_private = false 
        OR groups.leader_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = groups.id 
          AND group_members.user_id = auth.uid()
        )
        OR is_admin(auth.uid())  -- NOVO
      )
    )
  )
);
```

### Impacto

| Cenário | Antes | Depois |
|---------|-------|--------|
| Admin vendo metas de grupo privado | Bloqueado | Funciona |
| Admin vendo progresso de grupo privado | Bloqueado | Funciona |
| Líder/membro vendo seu grupo | Funciona | Funciona |
| Visitante vendo grupo público | Funciona | Funciona |
| Visitante vendo grupo privado | Bloqueado | Bloqueado |

### Arquivos Alterados

| Local | Tipo | Descrição |
|-------|------|-----------|
| Migração SQL | Banco | Atualizar políticas RLS de `member_commitments` e `goal_progress` |

