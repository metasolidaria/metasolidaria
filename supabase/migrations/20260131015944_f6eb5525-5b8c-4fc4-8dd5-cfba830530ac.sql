-- Update groups_public view to include private groups for members and leaders
CREATE OR REPLACE VIEW groups_public
WITH (security_invoker = on) AS
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
    COALESCE(gs.member_count, 0::bigint) AS member_count,
    COALESCE(gs.total_donations, 0::bigint) AS total_donations,
    COALESCE(gs.total_goals, 0::bigint) AS total_goals,
    g.view_count,
    g.members_visible
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE 
    g.is_private = false
    OR g.leader_id = auth.uid()
    OR is_group_member(auth.uid(), g.id);