
-- Drop and recreate views to add is_test filter

DROP VIEW IF EXISTS groups_public;
CREATE VIEW groups_public AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
       g.is_private, g.leader_id, g.leader_name, g.description,
       g.entity_id, g.end_date, g.created_at, g.updated_at,
       g.image_url, g.members_visible, g.view_count, g.is_test,
       g.default_commitment_name, g.default_commitment_metric,
       g.default_commitment_ratio, g.default_commitment_donation,
       g.default_commitment_goal,
       COALESCE(gs.member_count, 0) AS member_count,
       COALESCE(gs.total_goals, 0) AS total_goals,
       COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false
  AND g.is_test = false;

DROP VIEW IF EXISTS groups_my;
CREATE VIEW groups_my WITH (security_invoker = on) AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
       g.is_private, g.leader_id, g.leader_name, g.description,
       g.image_url, g.end_date, g.entity_id, g.members_visible,
       g.view_count, g.is_test,
       g.default_commitment_name, g.default_commitment_metric,
       g.default_commitment_ratio, g.default_commitment_donation,
       g.default_commitment_goal,
       g.created_at, g.updated_at,
       COALESCE(gs.member_count, 0) AS member_count,
       COALESCE(gs.total_goals, 0) AS total_goals,
       COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_test = false;

DROP VIEW IF EXISTS groups_search;
CREATE VIEW groups_search AS
SELECT g.id, g.name, g.city, g.is_private, g.leader_name,
       g.donation_type, g.description
FROM groups g
WHERE g.is_private = false
  AND g.is_test = false;
