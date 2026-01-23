-- Create indexes to speed up the aggregations
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_member_commitments_member_id ON member_commitments(member_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_group_id ON goal_progress(group_id);

-- Create a materialized view for group stats (much faster)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.group_stats AS
SELECT 
  g.id as group_id,
  COUNT(gm.id) as member_count,
  COALESCE(SUM(mc.personal_goal), 0) as total_goals,
  COALESCE((SELECT SUM(gp.amount) FROM goal_progress gp WHERE gp.group_id = g.id), 0) as total_donations
FROM groups g
LEFT JOIN group_members gm ON gm.group_id = g.id
LEFT JOIN member_commitments mc ON mc.member_id = gm.id
GROUP BY g.id;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_stats_group_id ON group_stats(group_id);

-- Recreate groups_public using the materialized view for performance
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
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_goals, 0) as total_goals,
  COALESCE(gs.total_donations, 0) as total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false;