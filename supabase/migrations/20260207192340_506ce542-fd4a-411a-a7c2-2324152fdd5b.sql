-- Drop and recreate groups_admin view WITHOUT security_invoker
-- This allows the view to access auth.users with view owner privileges
DROP VIEW IF EXISTS public.groups_admin;

CREATE VIEW public.groups_admin
WITH (security_barrier=true) AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.is_private,
  g.members_visible,
  g.leader_id,
  g.leader_name,
  g.leader_whatsapp,
  g.description,
  g.entity_id,
  g.image_url,
  g.end_date,
  g.created_at,
  g.updated_at,
  g.view_count,
  u.email as leader_email,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals
FROM public.groups g
LEFT JOIN auth.users u ON g.leader_id = u.id
LEFT JOIN public.group_stats gs ON g.id = gs.group_id
WHERE public.is_admin(auth.uid());

-- Grant select on the view to authenticated users
GRANT SELECT ON public.groups_admin TO authenticated;