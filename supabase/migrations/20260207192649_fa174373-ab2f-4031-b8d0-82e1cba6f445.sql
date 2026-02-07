-- Drop and recreate users_admin view WITHOUT security_invoker
-- This allows the view to access auth.users with view owner privileges
DROP VIEW IF EXISTS public.users_admin;

CREATE VIEW public.users_admin
WITH (security_barrier=true) AS
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
LEFT JOIN auth.users u ON u.id = p.user_id
WHERE public.is_admin(auth.uid());

-- Grant select on the view to authenticated users
GRANT SELECT ON public.users_admin TO authenticated;