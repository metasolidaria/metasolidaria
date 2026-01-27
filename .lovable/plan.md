
# Plano de Correção de Segurança - Meta Solidária

## Resumo Executivo

A análise de segurança identificou **6 vulnerabilidades** que precisam ser corrigidas, sendo **3 críticas** e **3 de baixa prioridade**. Este plano organiza as correções por ordem de prioridade e impacto.

---

## Vulnerabilidades Identificadas

### CRÍTICO - Prioridade Alta

| # | Vulnerabilidade | Risco | Impacto |
|---|----------------|-------|---------|
| 1 | Códigos de convite expostos publicamente | Qualquer pessoa pode listar códigos de convite e entrar em grupos privados | Invasão de privacidade de grupos |
| 2 | Telefones de entidades expostos | Números de organizações beneficiárias podem ser coletados para spam | Assédio a organizações vulneráveis |
| 3 | Estatísticas incluem grupos privados | Dados de grupos privados aparecem nas estatísticas públicas | Vazamento de informações privadas |

### MÉDIA - Prioridade Moderada

| # | Vulnerabilidade | Risco |
|---|----------------|-------|
| 4 | Views sem RLS explícito | Views usam `security_invoker=off` intencionalmente, mas precisam de documentação |
| 5 | Proteção de senhas vazadas desabilitada | Usuários podem usar senhas comprometidas em outros vazamentos |

### BAIXA - Prioridade Informacional

| # | Vulnerabilidade | Risco |
|---|----------------|-------|
| 6 | .gitignore sem proteção explícita para .env | Risco de commit acidental de secrets |

---

## Plano de Correção Detalhado

### Correção 1: Restringir Acesso aos Códigos de Convite

**Problema**: A política RLS atual permite que **qualquer pessoa** visualize todos os convites do tipo "link":
```sql
-- Política atual (VULNERÁVEL)
USING condition: ((invite_type = 'link') AND (status = 'pending') AND (expires_at > now()))
```

Isso expõe `invite_code` e `group_id` para todos os convites pendentes.

**Solução**: Modificar a política para permitir apenas consultas **com filtro específico por código**. Criar uma função RPC segura para validar convites.

**Migração SQL**:
```sql
-- 1. Remover política vulnerável
DROP POLICY IF EXISTS "Anyone can view link invitations by code for validation" ON group_invitations;

-- 2. Criar função segura para validar convite (não expõe lista)
CREATE OR REPLACE FUNCTION public.validate_invite_code(_invite_code text)
RETURNS TABLE (group_id uuid, group_name text, is_valid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    gi.group_id,
    g.name as group_name,
    true as is_valid
  FROM group_invitations gi
  JOIN groups g ON g.id = gi.group_id
  WHERE gi.invite_code = _invite_code
    AND gi.invite_type = 'link'
    AND gi.status = 'pending'
    AND gi.expires_at > now()
  LIMIT 1;
$$;
```

**Alteração no Frontend**: Atualizar `useInviteLink.tsx` para usar a nova RPC em vez de query direta.

---

### Correção 2: Ocultar Telefones de Entidades

**Problema**: A tabela `entities` tem política que permite leitura pública de **todos os campos**, incluindo `phone`:
```sql
-- Política atual
USING condition: true
```

**Solução**: Criar uma view pública que exclui o campo `phone`, mantendo a view como interface principal.

**Migração SQL**:
```sql
-- 1. Criar view pública sem telefone
CREATE VIEW public.entities_public
WITH (security_invoker = off) AS
SELECT 
  id,
  name,
  city,
  created_at
FROM entities;

-- 2. Conceder acesso à view
GRANT SELECT ON public.entities_public TO anon, authenticated;

-- 3. Remover política de leitura pública da tabela base
DROP POLICY IF EXISTS "Anyone can view entities" ON entities;

-- 4. Criar política restritiva: apenas criador pode ver dados completos
CREATE POLICY "Users can view their own entities"
  ON entities FOR SELECT
  USING (auth.uid() = created_by);

-- 5. Permitir líderes de grupos vinculados verem os dados
CREATE POLICY "Group leaders can view linked entities"
  ON entities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.entity_id = entities.id
      AND g.leader_id = auth.uid()
    )
  );
```

**Alteração no Frontend**: Atualizar hooks para usar `entities_public` em listagens públicas.

---

### Correção 3: Filtrar Grupos Privados das Estatísticas

**Problema**: A view `impact_stats_public` agrega dados de **todos os grupos**, incluindo privados.

**Solução**: Recriar a view com filtro `is_private = false`.

**Migração SQL**:
```sql
DROP VIEW IF EXISTS public.impact_stats_public;

CREATE VIEW public.impact_stats_public
WITH (security_invoker = off) AS
SELECT 
  g.donation_type,
  SUM(gp.amount) as total_amount,
  COUNT(gp.id) as total_entries
FROM goal_progress gp
JOIN groups g ON g.id = gp.group_id
WHERE g.is_private = false
GROUP BY g.donation_type;

GRANT SELECT ON public.impact_stats_public TO anon, authenticated;
```

---

### Correção 4: Filtrar Grupos Privados das Estatísticas do Hero

**Problema**: A view `hero_stats_public` conta **todos os grupos e membros**, incluindo privados.

**Solução**: Recriar a view contando apenas grupos públicos.

**Migração SQL**:
```sql
DROP VIEW IF EXISTS public.hero_stats_public;

CREATE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT count(*) FROM groups WHERE is_private = false) AS total_groups,
  (SELECT count(*) FROM group_members gm 
   JOIN groups g ON g.id = gm.group_id 
   WHERE g.is_private = false) AS total_users,
  (SELECT COALESCE(sum(mc.personal_goal), 0) 
   FROM member_commitments mc
   JOIN group_members gm ON gm.id = mc.member_id
   JOIN groups g ON g.id = gm.group_id
   WHERE g.is_private = false) AS total_goals;

GRANT SELECT ON public.hero_stats_public TO anon, authenticated;
```

---

### Correção 5: Adicionar .env ao .gitignore

**Solução**: Atualizar `.gitignore` para proteger arquivos de ambiente.

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local
```

---

### Correção 6: Habilitar Proteção de Senhas Vazadas

**Ação Manual**: Acessar o painel de backend e habilitar "Leaked Password Protection" nas configurações de autenticação.

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `.gitignore` | Adicionar proteção para .env |
| `src/hooks/useInviteLink.tsx` | Usar RPC `validate_invite_code` |
| `src/hooks/useEntities.tsx` | Usar view `entities_public` |
| `src/components/EntitiesSection.tsx` | Ajustar query se necessário |
| Migração SQL (5 scripts) | Corrigir RLS e views |

---

## Ordem de Execução Recomendada

1. **Migração 1**: Corrigir códigos de convite (CRÍTICO)
2. **Migração 2**: Ocultar telefones de entidades (CRÍTICO)
3. **Migração 3**: Filtrar impact_stats (CRÍTICO)
4. **Migração 4**: Filtrar hero_stats (MÉDIO)
5. **Código**: Atualizar frontend para usar novas views/RPCs
6. **Config**: Atualizar .gitignore
7. **Manual**: Habilitar proteção de senhas no backend

---

## Decisões Arquiteturais Mantidas

As seguintes decisões foram analisadas e consideradas **seguras** conforme documentação existente:

- Views `groups_public`, `partners_public`, `groups_search` com `security_invoker=off` - **Intencional** para acesso público a dados não-sensíveis
- View materializada `group_stats` exposta via API - **Aceitável** pois contém apenas estatísticas agregadas
- Funções SECURITY DEFINER - **Bem implementadas** com validação de `auth.uid()`
- CORS wildcard em edge functions - **Aceitável** com autenticação obrigatória

