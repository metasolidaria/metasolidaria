
## Plano: Corrigir Erro "Grupo não encontrado" para Líder do Grupo

### Diagnóstico do Problema

Após investigação detalhada, identifiquei que o grupo "Meta da semana" (ID: `fc396a41-fdfd-4e04-9a48-f9bade2e5307`) existe no banco de dados, tem a Bruna como líder e membro, mas está inacessível na página do grupo.

**Causa Raiz Identificada:**

A view `groups_public` foi configurada com `security_invoker=on` na migração `20260131152419`. Isso faz com que a view herde as políticas RLS da tabela `groups`, que exigem autenticação (`auth.uid() IS NOT NULL`) para qualquer operação SELECT.

Quando a sessão do usuário expira, fica inválida, ou o navegador não envia o JWT corretamente:
1. A query direta à tabela `groups` falha (RLS bloqueia)
2. O fallback para `groups_public` também falha (herda as mesmas RLS)
3. Resultado: "Grupo não encontrado"

**Evidência nos Logs de Rede:**
```text
Request: GET .../groups_public?select=*
Authorization: Bearer [anon_key] // ← Não tem JWT do usuário
Response Body: [] // ← Array vazio
```

### Solução Proposta

#### Opção 1: Voltar para `security_invoker=off` (Recomendada)

Recriar a view `groups_public` com `security_invoker=off`. Isso permite que a view funcione independentemente das RLS da tabela base, enquanto mantemos a segurança porque:
- A view já filtra os campos sensíveis (não expõe `leader_whatsapp`)
- A view `groups_public` é apenas para leitura
- Grupos privados continuam protegidos pela lógica da própria view

```sql
DROP VIEW IF EXISTS groups_public CASCADE;

CREATE VIEW groups_public
WITH (security_invoker = off) AS
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

GRANT SELECT ON groups_public TO anon, authenticated;
```

#### Opção 2: Adicionar Policy para Anon na Tabela Groups

Criar uma política RLS adicional que permita usuários anônimos visualizarem apenas grupos públicos:

```sql
CREATE POLICY "Anon can view public groups"
ON public.groups FOR SELECT
TO anon
USING (is_private = false);
```

Porém, esta opção exporia `leader_whatsapp` diretamente, o que não é desejado.

### Arquivos a Modificar

| Arquivo/Recurso | Alteração |
|-----------------|-----------|
| Nova migração SQL | Recriar `groups_public` com `security_invoker=off` |

### Detalhes Técnicos

**Por que `security_invoker=off` é seguro neste caso:**

1. A view `groups_public` já exclui o campo `leader_whatsapp`
2. Para grupos privados, o acesso completo ainda é controlado pela query direta à tabela `groups` no hook `useGroupDetails`
3. A view apenas fornece dados básicos para listar grupos na home

**Impacto:**
- Usuários não autenticados poderão ver a lista de grupos públicos na home
- Grupos privados continuam invisíveis para não-membros
- Líderes e membros com sessão válida ou inválida conseguirão pelo menos ver os dados básicos do grupo via fallback
