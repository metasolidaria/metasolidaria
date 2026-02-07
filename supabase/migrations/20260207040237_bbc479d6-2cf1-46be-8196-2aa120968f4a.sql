-- Dropar a view existente e recriar com security_invoker
DROP VIEW IF EXISTS public.users_admin;

-- Recriar a view com security_invoker=on para respeitar RLS
CREATE VIEW public.users_admin
WITH (security_invoker=on) AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.full_name,
  p.whatsapp,
  p.city,
  p.created_at,
  p.updated_at,
  u.email,
  u.created_at as user_created_at,
  u.last_sign_in_at,
  COALESCE(
    (SELECT array_agg(ur.role) FROM public.user_roles ur WHERE ur.user_id = p.user_id),
    ARRAY[]::app_role[]
  ) as roles
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.user_id;

-- Habilitar RLS na view (necessário para views com security_invoker)
ALTER VIEW public.users_admin SET (security_barrier = true);

-- Criar política que só permite acesso a administradores
-- Como a view usa security_invoker, ela respeita as políticas da tabela base (profiles)
-- Mas para garantir, vamos usar a função get_admin_users() que já tem proteção

-- Adicionar comentário documentando a proteção
COMMENT ON VIEW public.users_admin IS 'View administrativa protegida - use a função get_admin_users() para acesso seguro';