
## Plano: Corrigir Visibilidade de Grupos na Administração de Usuários

### Diagnóstico Confirmado

Através das requisições de rede, confirmei que:

1. **Requisição da Cristina (user_id=1a084e0d...)**: Retorna `[]` (vazio)
2. **O membro existe no banco**: group_id `fc477eae...` (Manas Fit), é privado

### Causa Raiz

A query `fetchUserGroups` faz um **INNER JOIN** entre `group_members` e `groups`:

```js
const { data, error } = await supabase
  .from("group_members")
  .select(`group_id, created_at, groups!inner(id, name, leader_id)`)
  .eq("user_id", userId);
```

**Fluxo do problema:**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Requisição fetchUserGroups                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Buscar em group_members onde user_id = Cristina                          │
│     └─ RLS: "Admins can view all" ✅ (is_admin() permite)                    │
│     └─ Encontra: Cristina é membro do grupo Manas Fit                        │
│                                                                              │
│  2. INNER JOIN com groups (para pegar nome do grupo)                        │
│     └─ RLS de groups: "is_private=false OR leader_id=auth.uid()              │
│                        OR is_group_member(auth.uid(), id)"                   │
│     └─ Manas Fit é privado ❌                                                │
│     └─ Admin não é líder ❌                                                  │
│     └─ Admin não é membro ❌                                                 │
│     └─ SEM is_admin() na política! ❌                                        │
│                                                                              │
│  3. Resultado: INNER JOIN falha → linha excluída → array vazio               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Política Atual de `groups` (SELECT)

```sql
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_private = false 
    OR leader_id = auth.uid() 
    OR is_group_member(auth.uid(), id)
    -- FALTA: is_admin(auth.uid())
  )
)
```

### Solução

Atualizar a política RLS de SELECT na tabela `groups` para incluir administradores:

```sql
DROP POLICY IF EXISTS "Authenticated users can view accessible groups" ON groups;

CREATE POLICY "Authenticated users can view accessible groups" 
ON groups FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_private = false 
    OR leader_id = auth.uid() 
    OR is_group_member(auth.uid(), id)
    OR is_admin(auth.uid())  -- ADICIONADO
  )
);
```

### Impacto

| Cenário | Antes | Depois |
|---------|-------|--------|
| Admin vendo grupos de usuários | Bloqueado (grupos privados) | Funciona |
| Admin acessando página do grupo privado | Bloqueado | Funciona |
| Líder/membro vendo seu grupo | Funciona | Funciona |
| Visitante vendo grupo público | Funciona | Funciona |
| Visitante vendo grupo privado | Bloqueado | Bloqueado |

### Segurança

Esta alteração é segura porque:
- Apenas usuários com papel `admin` na tabela `user_roles` ou e-mail na tabela `admin_emails` passam na verificação `is_admin()`
- A função `is_admin()` é `SECURITY DEFINER` e valida corretamente os privilégios
- O padrão é consistente com outras tabelas (`member_commitments`, `goal_progress`, `group_members`)

### Detalhes Técnicos

| Item | Valor |
|------|-------|
| Tabela | `groups` |
| Política afetada | `Authenticated users can view accessible groups` |
| Tipo de migração | DROP + CREATE da política |
| Impacto em dados | Nenhum (apenas permissões) |
