-- Update hero_stats_public to include ALL members (including test data with user_id = NULL)
DROP VIEW IF EXISTS public.hero_stats_public;

CREATE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT COUNT(*) FROM groups WHERE is_private = false) as total_groups,
  (SELECT COUNT(*) FROM group_members) as total_users,
  (SELECT COALESCE(SUM(personal_goal), 0) FROM member_commitments) as total_goals;