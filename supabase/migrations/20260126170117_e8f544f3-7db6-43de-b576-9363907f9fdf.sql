
-- Drop and recreate the groups_public view to include private groups for members/leaders
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
    g.leader_id,
    g.created_at,
    g.updated_at,
    g.is_private,
    g.leader_name,
    g.description,
    g.end_date,
    g.entity_id,
    COALESCE(gs.member_count, 0::bigint) AS member_count,
    COALESCE(gs.total_goals, 0::bigint) AS total_goals,
    COALESCE(gs.total_donations, 0::bigint) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE 
    g.is_private = false 
    OR g.leader_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
    );
