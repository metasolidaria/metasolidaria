-- Drop the existing view
DROP VIEW IF EXISTS public.users_admin;

-- Create a SECURITY DEFINER function to fetch admin user data
-- This bypasses RLS and allows access to auth.users data
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  profile_id uuid,
  user_id uuid,
  full_name text,
  whatsapp text,
  city text,
  created_at timestamptz,
  updated_at timestamptz,
  email varchar,
  user_created_at timestamptz,
  last_sign_in_at timestamptz,
  roles app_role[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE public.is_admin(auth.uid())
  ORDER BY p.created_at DESC;
$$;

-- Recreate the view using the function
CREATE OR REPLACE VIEW public.users_admin 
WITH (security_invoker = off)
AS 
  SELECT * FROM public.get_admin_users();

-- Grant necessary permissions
GRANT SELECT ON public.users_admin TO authenticated;