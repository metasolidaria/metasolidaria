
# Plano: Corrigir Erro "Permission Denied for Table Users"

## Problema Identificado
O erro de servidor no Safari (e possivelmente outros navegadores) está sendo causado por:
- **Erro**: `permission denied for table users`
- **Causa**: A view `users_admin` foi configurada com `security_invoker = on` na última migração de segurança
- **Conflito**: Isso faz a view tentar acessar `auth.users` com as permissões do usuário chamador, mesmo que a função `get_admin_users()` seja `SECURITY DEFINER`

## Análise Técnica
A função `get_admin_users()` já implementa segurança adequada:
1. Usa `SECURITY DEFINER` - executa com permissões do criador
2. Verifica `is_admin(auth.uid())` - só retorna dados para admins
3. O JOIN com `auth.users` funciona porque a função tem privilégios elevados

Porém, ao adicionar `security_invoker = on` na view:
- A view tenta validar permissões da tabela antes de chamar a função
- O usuário autenticado não tem acesso a `auth.users`
- Resultado: erro de permissão mesmo para admins

## Solução
Recriar a view `users_admin` **sem** `security_invoker = on`, mantendo apenas as restrições de GRANT que limitam o acesso a usuários autenticados.

## Alterações

### 1. Migração de Banco de Dados

```sql
-- Remover a view atual com security_invoker
DROP VIEW IF EXISTS public.users_admin;

-- Recriar a view SEM security_invoker 
-- (a função get_admin_users já é SECURITY DEFINER e verifica is_admin)
CREATE VIEW public.users_admin AS
SELECT 
  profile_id,
  user_id,
  full_name,
  whatsapp,
  city,
  created_at,
  updated_at,
  email,
  user_created_at,
  last_sign_in_at,
  roles
FROM get_admin_users();

-- Manter controle de acesso via GRANT
REVOKE ALL ON public.users_admin FROM anon, authenticated;
GRANT SELECT ON public.users_admin TO authenticated;
```

## Camadas de Segurança Mantidas

| Camada | Descrição |
|--------|-----------|
| Função `SECURITY DEFINER` | Executa com privilégios do criador, pode acessar `auth.users` |
| Verificação `is_admin()` | Dentro da função, só retorna dados se o chamador for admin |
| GRANT restritivo | Apenas usuários autenticados podem SELECT na view |

## Resultado Esperado
- Admins conseguirão acessar a página de administração de usuários
- Não-admins receberão resultado vazio (não erro de permissão)
- Funciona corretamente em Safari e todos os outros navegadores
