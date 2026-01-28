-- Drop dependent view first
DROP VIEW IF EXISTS public.groups_admin;

-- Drop the function to allow changing return type
DROP FUNCTION IF EXISTS public.get_admin_groups();

-- Recreate function with view_count
CREATE FUNCTION public.get_admin_groups()
RETURNS TABLE(
  id uuid,
  name text,
  city text,
  donation_type text,
  goal_2026 integer,
  is_private boolean,
  leader_id uuid,
  leader_name text,
  leader_whatsapp text,
  leader_email character varying,
  description text,
  entity_id uuid,
  image_url text,
  end_date date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  member_count bigint,
  total_donations bigint,
  total_goals bigint,
  view_count integer
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
    u.email as leader_email,
    g.description,
    g.entity_id,
    g.image_url,
    g.end_date,
    g.created_at,
    g.updated_at,
    COALESCE(gs.member_count, 0) as member_count,
    COALESCE(gs.total_donations, 0) as total_donations,
    COALESCE(gs.total_goals, 0) as total_goals,
    g.view_count
  FROM public.groups g
  LEFT JOIN public.group_stats gs ON gs.group_id = g.id
  LEFT JOIN auth.users u ON u.id = g.leader_id
  WHERE public.is_admin(auth.uid())
  ORDER BY g.created_at DESC;
$$;

-- Recreate the view
CREATE VIEW public.groups_admin AS
SELECT * FROM public.get_admin_groups();