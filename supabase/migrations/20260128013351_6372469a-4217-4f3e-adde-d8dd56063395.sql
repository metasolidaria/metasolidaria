-- Recriar a view users_admin com security_invoker=on para garantir que 
-- as permissões do usuário sejam verificadas ao acessar a view
DROP VIEW IF EXISTS public.users_admin;

CREATE VIEW public.users_admin
WITH (security_invoker = on) AS
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

-- Garantir que apenas admins possam acessar a view
REVOKE ALL ON public.users_admin FROM anon, authenticated;
GRANT SELECT ON public.users_admin TO authenticated;