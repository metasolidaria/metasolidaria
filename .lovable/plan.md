
# Plano: Corrigir View groups_admin - Permission Denied

## Problema Identificado
A página de Administração de Grupos não está mostrando dados devido ao mesmo problema que afetou a view `users_admin`:
- **Erro**: `permission denied for table users`
- **Causa**: A view `groups_admin` está com `security_invoker = on`
- **Conflito**: A view faz JOIN com `auth.users` para obter o email do líder, mas o usuário autenticado não tem permissão direta nessa tabela

## Situação Atual

```text
┌─────────────────────────────────────────────────────────────┐
│ View: groups_admin (security_invoker = on)                  │
│                                                             │
│   SELECT ... FROM groups g                                  │
│   LEFT JOIN auth.users u ON u.id = g.leader_id  ← ERRO!     │
│                                                             │
│   Usuário autenticado não tem acesso a auth.users           │
└─────────────────────────────────────────────────────────────┘
```

## Solução
Igual à correção aplicada para `users_admin`:
1. Recriar a view `groups_admin` **sem** `security_invoker = on`
2. Usar a função `get_admin_groups()` que já existe e é `SECURITY DEFINER`

## Alterações

### Migração de Banco de Dados

```sql
-- Remover a view com security_invoker
DROP VIEW IF EXISTS public.groups_admin;

-- Recriar baseada na função SECURITY DEFINER
CREATE VIEW public.groups_admin AS
SELECT 
  id, name, city, donation_type, goal_2026, is_private,
  leader_id, leader_name, leader_whatsapp, leader_email,
  description, entity_id, image_url, end_date,
  created_at, updated_at, member_count, total_donations, total_goals
FROM get_admin_groups();

-- Manter controle de acesso restritivo
REVOKE ALL ON public.groups_admin FROM anon, authenticated;
GRANT SELECT ON public.groups_admin TO authenticated;
```

## Camadas de Segurança

| Camada | Descrição |
|--------|-----------|
| Função `SECURITY DEFINER` | `get_admin_groups()` executa com privilégios do criador |
| Verificação `is_admin()` | A função só retorna dados para admins |
| GRANT restritivo | Apenas usuários autenticados podem SELECT |

## Arquivos Afetados

Apenas a migração de banco de dados - nenhuma alteração de código necessária.

## Resultado Esperado
- Página de Administração de Grupos exibirá todos os grupos corretamente
- Funciona em todos os navegadores (Safari, Chrome, etc.)
- Segurança mantida através das múltiplas camadas de proteção
