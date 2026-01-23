-- Update hero_stats_public view to include total goals
CREATE OR REPLACE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT COUNT(*) FROM groups WHERE is_private = false) as total_groups,
  (SELECT COUNT(DISTINCT user_id) FROM group_members WHERE user_id IS NOT NULL) as total_users,
  (SELECT COALESCE(SUM(personal_goal), 0) FROM member_commitments) as total_goals;