

## Diagnóstico: Inconsistência de Dados no Grupo "Manas Fit"

### Resumo do Problema

O grupo "Manas Fit" aparece corretamente no resumo (1 membro, 24 metas), mas ao acessar a página do grupo, membros e metas não aparecem.

### Dados Confirmados no Banco

| Dado | Valor |
|------|-------|
| Grupo | Manas Fit (ID: fc477eae...) |
| Privado | Sim (`is_private = true`) |
| Membro | Cristina Buzzanca (líder) |
| Meta (commitment) | 24 (personal_goal) em "3 Cardio por semana" |
| group_stats | member_count=1, total_goals=24 |

### Causa Raiz

A view `group_members_public` está configurada com **`security_invoker=on`**, o que significa que ela herda as políticas RLS das tabelas base.

```text
┌─────────────────────────────────────────────────────────────┐
│                 FLUXO DE DADOS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useGroupDetails                                            │
│       │                                                     │
│       ▼                                                     │
│  group_members_public (security_invoker=ON)                 │
│       │                                                     │
│       ▼                                                     │
│  JOIN com tabela groups ──► RLS é aplicado                 │
│       │                                                     │
│       ▼                                                     │
│  Para grupos PRIVADOS, RLS exige:                          │
│  • auth.uid() IS NOT NULL (sessão válida)                  │
│  • E ser líder OU membro                                    │
│       │                                                     │
│       ▼                                                     │
│  Se sessão inválida/expirada ──► Retorna VAZIO             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Por que o Resumo Funciona mas os Detalhes Não?

- **Resumo/Listagem**: Usa `groups_admin` (para admins) ou `groups_public` que têm dados pré-agregados da view `group_stats`
- **Detalhes de Membros**: Consulta `group_members_public` que aplica RLS e falha para grupos privados

### Comparação das Views

| View | security_invoker | Comportamento |
|------|------------------|---------------|
| `groups_public` | OFF | Bypassa RLS, filtra manualmente `is_private=false` |
| `groups_admin` | OFF (barrier) | Bypassa RLS, verifica `is_admin()` na query |
| `group_members_public` | **ON** | Herda RLS - causa o problema |

### Solução Proposta

Recriar a view `group_members_public` com `security_invoker=off` e adicionar filtros explícitos para manter a segurança:

#### Migração SQL

```sql
CREATE OR REPLACE VIEW group_members_public
WITH (security_invoker = off) AS
SELECT 
    gm.id,
    gm.group_id,
    gm.user_id,
    gm.name,
    gm.personal_goal,
    gm.goals_reached,
    gm.commitment_type,
    gm.commitment_metric,
    gm.commitment_ratio,
    gm.commitment_donation,
    gm.penalty_donation,
    gm.created_at,
    gm.updated_at,
    CASE
        WHEN g.whatsapp_visible = true THEN gm.whatsapp
        WHEN gm.user_id = auth.uid() THEN gm.whatsapp
        WHEN g.leader_id = auth.uid() THEN gm.whatsapp
        WHEN is_admin(auth.uid()) THEN gm.whatsapp
        ELSE NULL
    END AS whatsapp
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
WHERE 
    -- Grupo público: qualquer pessoa pode ver
    g.is_private = false
    -- OU grupo privado: apenas líder, membros ou admin podem ver
    OR g.leader_id = auth.uid()
    OR is_group_member(auth.uid(), g.id)
    OR is_admin(auth.uid());
```

### Impacto da Mudança

| Cenário | Antes | Depois |
|---------|-------|--------|
| Admin vendo grupo privado | Pode falhar | Funciona |
| Líder vendo seu grupo privado | Pode falhar com sessão expirada | Funciona |
| Membro vendo grupo privado | Pode falhar | Funciona |
| Visitante vendo grupo público | Funciona | Funciona |
| Visitante vendo grupo privado | Não vê membros | Não vê membros (correto) |

### Arquivos Alterados

| Local | Tipo | Descrição |
|-------|------|-----------|
| Migração SQL | Banco | Recriar view `group_members_public` com `security_invoker=off` |

### Observação Técnica

A lógica de visibilidade do WhatsApp continua funcionando através da cláusula `CASE`, garantindo que números pessoais só apareçam para quem tem permissão.

