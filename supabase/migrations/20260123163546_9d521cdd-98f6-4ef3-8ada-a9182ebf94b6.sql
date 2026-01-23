-- Create a public view for hero stats without RLS restrictions
CREATE OR REPLACE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT COUNT(*) FROM groups WHERE is_private = false) as total_groups,
  (SELECT COUNT(DISTINCT user_id) FROM group_members WHERE user_id IS NOT NULL) as total_users;