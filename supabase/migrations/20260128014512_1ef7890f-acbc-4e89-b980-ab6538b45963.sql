-- Remove the current view with security_invoker
DROP VIEW IF EXISTS public.users_admin;

-- Recreate the view WITHOUT security_invoker 
-- (the get_admin_users function is already SECURITY DEFINER and checks is_admin)
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

-- Maintain access control via GRANT
REVOKE ALL ON public.users_admin FROM anon, authenticated;
GRANT SELECT ON public.users_admin TO authenticated;