-- Add view_count column to groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create a function to increment view count (bypasses RLS for anonymous access)
CREATE OR REPLACE FUNCTION public.increment_group_view_count(_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE groups
  SET view_count = view_count + 1
  WHERE id = _group_id;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.increment_group_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_group_view_count(uuid) TO anon;

-- Update groups_public view to include view_count
DROP VIEW IF EXISTS public.groups_public;
CREATE VIEW public.groups_public 
WITH (security_invoker = on)
AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.is_private,
  g.leader_id,
  g.leader_name,
  g.description,
  g.entity_id,
  g.image_url,
  g.end_date,
  g.created_at,
  g.updated_at,
  g.view_count,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals
FROM public.groups g
LEFT JOIN public.group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false 
   OR g.leader_id = auth.uid() 
   OR public.is_group_member(auth.uid(), g.id);