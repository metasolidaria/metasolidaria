-- Create a SECURITY DEFINER function to fetch all groups for admins
-- This bypasses RLS to allow admins to see all groups including private ones
CREATE OR REPLACE FUNCTION public.get_admin_groups()
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  donation_type text,
  goal_2026 integer,
  is_private boolean,
  leader_id uuid,
  leader_name text,
  leader_whatsapp text,
  description text,
  entity_id uuid,
  image_url text,
  end_date date,
  created_at timestamptz,
  updated_at timestamptz,
  member_count bigint,
  total_donations bigint,
  total_goals bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.city,
    g.donation_type,
    g.goal_2026,
    g.is_private,
    g.leader_id,
    g.leader_name,
    g.leader_whatsapp,
    g.description,
    g.entity_id,
    g.image_url,
    g.end_date,
    g.created_at,
    g.updated_at,
    COALESCE(gs.member_count, 0) as member_count,
    COALESCE(gs.total_donations, 0) as total_donations,
    COALESCE(gs.total_goals, 0) as total_goals
  FROM public.groups g
  LEFT JOIN public.group_stats gs ON gs.group_id = g.id
  WHERE public.is_admin(auth.uid())
  ORDER BY g.created_at DESC;
$$;

-- Create a view for admin groups access
CREATE OR REPLACE VIEW public.groups_admin
WITH (security_invoker = off)
AS 
  SELECT * FROM public.get_admin_groups();

-- Grant necessary permissions
GRANT SELECT ON public.groups_admin TO authenticated;

-- Allow admins to update any group
CREATE POLICY "Admins can update any group" 
ON public.groups 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Allow admins to delete any group
CREATE POLICY "Admins can delete any group" 
ON public.groups 
FOR DELETE 
USING (public.is_admin(auth.uid()));