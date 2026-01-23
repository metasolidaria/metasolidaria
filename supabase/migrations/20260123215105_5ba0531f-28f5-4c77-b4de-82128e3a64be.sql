-- Drop and recreate the groups_public view to include member counts and goals
DROP VIEW IF EXISTS public.groups_public;

CREATE VIEW public.groups_public
WITH (security_invoker = off) AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.leader_id,
  g.created_at,
  g.updated_at,
  g.is_private,
  g.leader_name,
  g.description,
  g.end_date,
  g.entity_id,
  (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
  (SELECT COALESCE(SUM(mc.personal_goal), 0) FROM member_commitments mc 
   JOIN group_members gm ON mc.member_id = gm.id WHERE gm.group_id = g.id) as total_goals,
  (SELECT COALESCE(SUM(gp.amount), 0) FROM goal_progress gp WHERE gp.group_id = g.id) as total_donations
FROM groups g
WHERE g.is_private = false;