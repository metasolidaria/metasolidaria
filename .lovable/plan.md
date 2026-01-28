
# Plano: Unificar Sistema de Permissões Administrativas

## Situação Atual

O sistema possui duas fontes de verdade separadas para acesso administrativo:

| Sistema | Função | Usuários com acesso |
|---------|--------|---------------------|
| `admin_emails` | Controla acesso ao painel e RLS | dbsmetasolidaria@gmail.com, dbmetasolidaria@gmail.com |
| `user_roles` (role='admin') | Apenas exibe badge na UI | pierohsbueno@msn.com, dbmetasolidaria@gmail.com |

**Problema:** `pierohsbueno@msn.com` tem papel "admin" mas não consegue acessar a administração.

---

## Solução Proposta

Modificar a função `is_admin()` para verificar AMBAS as fontes:
- Se o email está em `admin_emails` **OU**
- Se o usuário tem role `admin` em `user_roles`

### Alteração na Função SQL

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Verifica admin_emails (compatibilidade)
    SELECT 1
    FROM public.admin_emails ae
    JOIN auth.users u ON lower(u.email) = lower(ae.email)
    WHERE u.id = _user_id
  ) OR EXISTS (
    -- Verifica user_roles com role 'admin'
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'
  )
$$;
```

---

## Benefícios

1. **Compatibilidade**: Mantém acesso dos emails já cadastrados em `admin_emails`
2. **Unificação**: Permite conceder acesso admin via interface (atribuindo role)
3. **Sem quebra**: Nenhum código frontend precisa ser alterado
4. **Segurança**: Mantém verificação server-side via RLS

---

## Arquivos/Recursos a Modificar

| Recurso | Alteração |
|---------|-----------|
| Função SQL `is_admin()` | Adicionar verificação em `user_roles` |

---

## Resultado Esperado

Após a alteração:
- `pierohsbueno@msn.com` terá acesso ao painel administrativo
- Novos administradores podem ser criados atribuindo o papel "admin" via interface
- A tabela `admin_emails` pode ser gradualmente descontinuada

---

## Considerações Futuras

Após a unificação funcionar, pode-se opcionalmente:
1. Migrar todos os emails de `admin_emails` para `user_roles` com role='admin'
2. Remover a verificação de `admin_emails` da função
3. Adicionar interface para gerenciar `admin_emails` (se preferir manter ambos)
