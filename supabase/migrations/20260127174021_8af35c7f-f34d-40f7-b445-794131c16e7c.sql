
-- Reverter hero_stats_public para contar TODOS os grupos (as estatísticas são agregadas e não expõem dados sensíveis)
DROP VIEW IF EXISTS public.hero_stats_public;

CREATE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT count(*) FROM groups) AS total_groups,
  (SELECT count(*) FROM group_members) AS total_users,
  (SELECT COALESCE(sum(mc.personal_goal), 0) FROM member_commitments mc) AS total_goals;

GRANT SELECT ON public.hero_stats_public TO anon, authenticated;

-- Reverter impact_stats_public para incluir TODOS os grupos
DROP VIEW IF EXISTS public.impact_stats_public;

CREATE VIEW public.impact_stats_public
WITH (security_invoker = off) AS
SELECT 
  g.donation_type,
  COALESCE(SUM(gp.amount), 0) as total_amount,
  COUNT(gp.id) as total_entries
FROM groups g
LEFT JOIN goal_progress gp ON gp.group_id = g.id
GROUP BY g.donation_type;

GRANT SELECT ON public.impact_stats_public TO anon, authenticated;
