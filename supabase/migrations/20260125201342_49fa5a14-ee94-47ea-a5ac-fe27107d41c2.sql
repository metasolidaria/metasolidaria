-- Drop and recreate hero_stats_public to count all groups (public + private)
DROP VIEW IF EXISTS public.hero_stats_public;

CREATE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
    (SELECT count(*) FROM groups) AS total_groups,
    (SELECT count(*) FROM group_members) AS total_users,
    (SELECT COALESCE(sum(personal_goal), 0) FROM member_commitments) AS total_goals;